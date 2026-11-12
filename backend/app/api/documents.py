import uuid
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, get_db
from app.models.document import Document, DocumentAccessLevel, DocumentChunk, DocumentSourceType
from app.models.organization import Organization
from app.models.user import User
from app.schemas.document import DocumentChunkResponse, DocumentCreate, DocumentResponse
from app.services.rag_engine import SecureRAGEngine

router = APIRouter(prefix="/documents", tags=["Documents"])
rag_engine = SecureRAGEngine()


class DocumentIngestRequest(BaseModel):
    title: str
    content: str
    access_level: DocumentAccessLevel = DocumentAccessLevel.INTERNAL
    source_type: DocumentSourceType = DocumentSourceType.UPLOAD
    file_type: str = "md"
    metadata: Dict[str, Any] = {}


class DocumentSearchRequest(BaseModel):
    query: str
    top_k: int = 3
    max_access_level: Optional[DocumentAccessLevel] = None


@router.post("/ingest", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def ingest_document(
    payload: DocumentIngestRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Ingests document content, chunks into semantic segments, computes
    vector embeddings, scans for PII, and stores in the tenant's knowledge store.
    """
    doc = await rag_engine.ingest_document(
        db=db,
        org_id=current_user.org_id,
        title=payload.title,
        content=payload.content,
        access_level=payload.access_level,
        source_type=payload.source_type,
        file_type=payload.file_type,
        metadata=payload.metadata,
    )
    stmt = select(Document).where(Document.id == doc.id).options(selectinload(Document.chunks))
    result = await db.execute(stmt)
    return result.scalars().first()


@router.post("/search", response_model=List[Dict[str, Any]])
async def search_documents(
    payload: DocumentSearchRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Performs vector similarity search restricted strictly to the user's
    organization boundary and authorized document classification level.
    """
    results = await rag_engine.search_documents(
        db=db,
        org_id=current_user.org_id,
        user_role=current_user.role,
        query=payload.query,
        top_k=payload.top_k,
        max_access_level=payload.max_access_level,
    )
    return results


@router.get("/", response_model=List[DocumentResponse])
async def list_documents(
    access_level: Optional[DocumentAccessLevel] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        select(Document)
        .where(Document.org_id == current_user.org_id)
        .options(selectinload(Document.chunks))
    )
    if access_level:
        query = query.where(Document.access_level == access_level)

    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = (
        select(Document)
        .where(Document.id == document_id, Document.org_id == current_user.org_id)
        .options(selectinload(Document.chunks))
    )
    result = await db.execute(stmt)
    doc = result.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = await db.get(Document, document_id)
    if not doc or doc.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Document not found")
    await db.delete(doc)
    await db.commit()
