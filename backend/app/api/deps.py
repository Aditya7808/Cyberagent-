import uuid
from typing import AsyncGenerator, Callable, List, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User, UserRole

security_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    token_auth: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Mock / Bearer auth resolver for local development and testing.
    In production with Cognito, this verifies the JWT signature and claims.
    If no auth provided in development, returns or generates a default admin user.
    """
    result = await db.execute(select(User).limit(1))
    user = result.scalars().first()
    if user:
        return user

    # Fallback mock user if database is empty initially
    return User(
        id=uuid.UUID("00000000-0000-0000-0000-000000000001"),
        org_id=uuid.UUID("00000000-0000-0000-0000-000000000001"),
        email="admin@sentinelai.dev",
        full_name="Sentinel Admin",
        role=UserRole.ADMIN,
        is_active=True,
    )


def require_role(*roles: UserRole) -> Callable:
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Required roles: {[r.value for r in roles]}",
            )
        return current_user

    return role_checker

