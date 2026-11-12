import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_db
from app.models.document import Document, DocumentAccessLevel, DocumentChunk
from app.models.organization import Organization
from app.schemas.document import DocumentChunkResponse, DocumentCreate, DocumentResponse

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("/", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_document(
    payload: DocumentCreate,
    db: AsyncSession = Depends(get_db),
):
    org = await db.get(Organization, payload.org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    doc = Document(
        org_id=payload.org_id,
        title=payload.title,
        source_type=payload.source_type,
        access_level=payload.access_level,
        s3_key=payload.s3_key,
        file_type=payload.file_type,
        metadata_=payload.metadata_,
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return doc


@router.get("/", response_model=List[DocumentResponse])
async def list_documents(
    org_id: Optional[uuid.UUID] = None,
    access_level: Optional[DocumentAccessLevel] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(Document)
    if org_id:
        query = query.where(Document.org_id == org_id)
    if access_level:
        query = query.where(Document.access_level == access_level)
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(document_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    stmt = select(Document).where(Document.id == document_id).options(selectinload(Document.chunks))
    result = await db.execute(stmt)
    doc = result.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(document_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    doc = await db.get(Document, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    await db.delete(doc)
    await db.commit()


@router.get("/{document_id}/chunks", response_model=List[DocumentChunkResponse])
async def list_document_chunks(document_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    doc = await db.get(Document, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    result = await db.execute(select(DocumentChunk).where(DocumentChunk.document_id == document_id))
    return result.scalars().all()

