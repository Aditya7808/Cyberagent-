import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict
from app.models.document import DocumentAccessLevel, DocumentSourceType


class DocumentBase(BaseModel):
    title: str
    source_type: DocumentSourceType = DocumentSourceType.UPLOAD
    access_level: DocumentAccessLevel = DocumentAccessLevel.INTERNAL
    file_type: Optional[str] = None
    metadata_: Dict[str, Any] = {}


class DocumentCreate(DocumentBase):
    org_id: uuid.UUID
    s3_key: Optional[str] = None


class DocumentChunkResponse(BaseModel):
    id: uuid.UUID
    document_id: uuid.UUID
    chunk_index: int
    content: str
    metadata_: Dict[str, Any] = {}

    model_config = ConfigDict(from_attributes=True)


class DocumentResponse(DocumentBase):
    id: uuid.UUID
    org_id: uuid.UUID
    s3_key: Optional[str] = None
    created_at: datetime
    chunks: Optional[List[DocumentChunkResponse]] = None

    model_config = ConfigDict(from_attributes=True)
