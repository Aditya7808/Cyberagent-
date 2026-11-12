import uuid
from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, ConfigDict
from app.models.policy import PolicyType


class PolicyBase(BaseModel):
    name: str
    policy_type: PolicyType
    rules: Dict[str, Any] = {}
    enabled: bool = True


class PolicyCreate(PolicyBase):
    org_id: uuid.UUID


class PolicyUpdate(BaseModel):
    name: Optional[str] = None
    rules: Optional[Dict[str, Any]] = None
    enabled: Optional[bool] = None


class PolicyResponse(PolicyBase):
    id: uuid.UUID
    org_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

