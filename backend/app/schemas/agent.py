import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict
from app.models.agent import AgentStatus
from app.schemas.tool import ToolResponse


class AgentBase(BaseModel):
    name: str
    model_id: str = "anthropic.claude-3-sonnet-20240229-v1:0"
    system_prompt: str = ""
    config: Dict[str, Any] = {}
    status: AgentStatus = AgentStatus.DRAFT


class AgentCreate(AgentBase):
    org_id: uuid.UUID


class AgentUpdate(BaseModel):
    name: Optional[str] = None
    model_id: Optional[str] = None
    system_prompt: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    status: Optional[AgentStatus] = None


class AgentResponse(AgentBase):
    id: uuid.UUID
    org_id: uuid.UUID
    created_by: Optional[uuid.UUID]
    created_at: datetime
    updated_at: datetime
    tools: List[ToolResponse] = []

    model_config = ConfigDict(from_attributes=True)

