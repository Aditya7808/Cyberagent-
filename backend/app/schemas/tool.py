import uuid
from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, ConfigDict
from app.models.tool import ToolAuthLevel


class ToolBase(BaseModel):
    tool_name: str
    description: Optional[str] = None
    parameters_schema: Dict[str, Any] = {}
    auth_level: ToolAuthLevel = ToolAuthLevel.OPEN
    enabled: bool = True


class ToolCreate(ToolBase):
    pass


class ToolUpdate(BaseModel):
    tool_name: Optional[str] = None
    description: Optional[str] = None
    parameters_schema: Optional[Dict[str, Any]] = None
    auth_level: Optional[ToolAuthLevel] = None
    enabled: Optional[bool] = None


class ToolResponse(ToolBase):
    id: uuid.UUID
    agent_id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
