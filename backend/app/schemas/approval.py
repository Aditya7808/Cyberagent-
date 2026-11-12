import uuid
from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, ConfigDict
from app.models.approval import ApprovalStatus


class ToolApprovalCreate(BaseModel):
    agent_id: uuid.UUID
    conversation_id: Optional[uuid.UUID] = None
    tool_name: str
    parameters: Dict[str, Any] = {}


class ToolApprovalResolve(BaseModel):
    approved: bool
    review_comment: Optional[str] = None


class ToolApprovalResponse(BaseModel):
    id: uuid.UUID
    org_id: uuid.UUID
    agent_id: uuid.UUID
    conversation_id: Optional[uuid.UUID] = None
    tool_name: str
    parameters: Dict[str, Any]
    status: ApprovalStatus
    requested_by: Optional[uuid.UUID] = None
    reviewed_by: Optional[uuid.UUID] = None
    review_comment: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

