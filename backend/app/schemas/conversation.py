import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict
from app.models.conversation import ConversationStatus, MessageRole


class MessageCreate(BaseModel):
    content: str


class MessageResponse(BaseModel):
    id: uuid.UUID
    conversation_id: uuid.UUID
    role: MessageRole
    content: str
    tool_call_id: Optional[str] = None
    security_metadata: Optional[Dict[str, Any]] = None
    tokens_used: int = 0
    latency_ms: Optional[float] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ConversationCreate(BaseModel):
    agent_id: uuid.UUID
    title: Optional[str] = "New Conversation"


class ConversationResponse(BaseModel):
    id: uuid.UUID
    org_id: uuid.UUID
    agent_id: uuid.UUID
    user_id: Optional[uuid.UUID]
    title: str
    status: ConversationStatus
    created_at: datetime
    updated_at: datetime
    messages: Optional[List[MessageResponse]] = None

    model_config = ConfigDict(from_attributes=True)
