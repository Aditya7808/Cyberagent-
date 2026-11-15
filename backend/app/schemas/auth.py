import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from app.models.user import UserRole


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    org_id: Optional[uuid.UUID] = None


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: Optional[UserRole] = UserRole.END_USER


class UserRoleUpdateRequest(BaseModel):
    role: UserRole


class UserProfileResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str
    role: UserRole
    org_id: uuid.UUID
    clearance_level: str
    permissions: List[str]
    created_at: Optional[datetime] = None


class UserListItemResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str
    role: UserRole
    clearance_level: str
    is_active: bool
    created_at: Optional[datetime] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfileResponse


class GoogleAuthRequest(BaseModel):
    credential: Optional[str] = None
    access_token: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None

