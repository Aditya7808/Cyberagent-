import uuid
from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, ConfigDict


class OrgBase(BaseModel):
    name: str
    slug: str
    settings: Dict[str, Any] = {}


class OrgCreate(OrgBase):
    pass


class OrgUpdate(BaseModel):
    name: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None


class OrgResponse(OrgBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

