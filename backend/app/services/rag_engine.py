import logging
import uuid
from typing import Any, Dict, List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.document import (
    Document,
    DocumentAccessLevel,
    DocumentChunk,
    DocumentSourceType,
)
from app.models.user import UserRole
from app.security.pii_engine import CustomPIIEngine
from app.services.rag_service import EmbeddingGenerator, TextChunker

logger = logging.getLogger("sentinel.services.rag_engine")

ROLE_PERMITTED_LEVELS = {
    UserRole.VIEWER: [
        DocumentAccessLevel.PUBLIC,
        DocumentAccessLevel.INTERNAL,
    ],
    UserRole.OPERATOR: [
        DocumentAccessLevel.PUBLIC,
        DocumentAccessLevel.INTERNAL,
        DocumentAccessLevel.CONFIDENTIAL,
    ],
    UserRole.ADMIN: [
        DocumentAccessLevel.PUBLIC,
        DocumentAccessLevel.INTERNAL,
        DocumentAccessLevel.CONFIDENTIAL,
        DocumentAccessLevel.RESTRICTED,
    ],
}


class SecureRAGEngine:
    """
    Tenant-Isolated & Document-Level Access Controlled RAG Engine.
    Guarantees that:
    1. Cross-tenant retrieval is strictly impossible (hard org_id filter).
    2. Users cannot retrieve documents exceeding their role clearance.
    3. Retrieved chunks are scanned and sanitized before returning to agents.
    """

    def __init__(self):
        self.chunker = TextChunker(chunk_size=500, chunk_overlap=80)
        self.pii_engine = CustomPIIEngine()

    async def ingest_document(
        self,
        db: AsyncSession,
        org_id: uuid.UUID,
        title: str,
        content: str,
        access_level: DocumentAccessLevel = DocumentAccessLevel.INTERNAL,
        source_type: DocumentSourceType = DocumentSourceType.UPLOAD,
        file_type: str = "md",
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Document:
        """
        Chunks text, generates embeddings, scans for PII, and stores in database.
        """
        # PII scan of source content
        _, pii_detected, _ = self.pii_engine.scan_and_redact(content)

        meta = dict(metadata or {})
        meta["pii_detected_count"] = len(pii_detected)
        meta["has_pii"] = len(pii_detected) > 0

        doc = Document(
            org_id=org_id,
            title=title,
            source_type=source_type,
            access_level=access_level,
            file_type=file_type,
            metadata_=meta,
        )
        db.add(doc)
        await db.flush()

        # Split into chunks
        chunks_text = self.chunker.split_text(content)
        for idx, chunk_str in enumerate(chunks_text):
            vector = EmbeddingGenerator.generate_embedding(chunk_str)
            chunk = DocumentChunk(
                document_id=doc.id,
                chunk_index=idx,
                content=chunk_str,
                embedding=vector,
                metadata_={"chunk_index": idx, "length": len(chunk_str)},
            )
            db.add(chunk)

        await db.commit()
        await db.refresh(doc)
        logger.info(f"Ingested doc '{title}' ({access_level.value}) with {len(chunks_text)} chunks for org={org_id}")
        return doc

    async def search_documents(
        self,
        db: AsyncSession,
        org_id: uuid.UUID,
        user_role: UserRole,
        query: str,
        top_k: int = 3,
        max_access_level: Optional[DocumentAccessLevel] = None,
    ) -> List[Dict[str, Any]]:
        """
        Executes tenant-isolated vector search with document ACL enforcement.
        """
        allowed_levels = list(ROLE_PERMITTED_LEVELS.get(user_role, [DocumentAccessLevel.PUBLIC]))
        if max_access_level and max_access_level in allowed_levels:
            idx = allowed_levels.index(max_access_level)
            allowed_levels = allowed_levels[: idx + 1]

        query_vector = EmbeddingGenerator.generate_embedding(query)

        # Query chunks with Document join
        stmt = (
            select(DocumentChunk, Document)
            .join(Document, DocumentChunk.document_id == Document.id)
            .where(
                Document.org_id == org_id,  # STRICT TENANT ISOLATION
                Document.access_level.in_(allowed_levels),  # DOCUMENT ACL
            )
            .limit(top_k * 3)  # Fetch candidates to rank
        )

        result = await db.execute(stmt)
        rows = result.all()

        # Rank candidates by cosine distance between query_vector and chunk.embedding
        scored_results: List[Dict[str, Any]] = []
        for chunk, doc in rows:
            # Cosine similarity between normalized vectors
            sim = 0.5  # default baseline
            if chunk.embedding is not None:
                dot_product = sum(a * b for a, b in zip(query_vector, chunk.embedding))
                sim = max(0.0, min(1.0, (dot_product + 1.0) / 2.0))

            # Scan chunk for PII preview
            sanitized_chunk, pii_detected, _ = self.pii_engine.scan_and_redact(chunk.content)

            scored_results.append({
                "chunk_id": str(chunk.id),
                "document_id": str(doc.id),
                "document_title": doc.title,
                "access_level": doc.access_level.value,
                "relevance_score": round(sim, 3),
                "content": sanitized_chunk,
                "pii_redacted": len(pii_detected) > 0,
                "tenant_id": str(doc.org_id),
            })

        # Sort descending by relevance
        scored_results.sort(key=lambda x: x["relevance_score"], reverse=True)
        return scored_results[:top_k]

