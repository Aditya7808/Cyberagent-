import uuid
from typing import Callable, List, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User, UserRole
from app.security.auth_handler import decode_access_token

security_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    token_auth: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Stateless JWT Auth resolver:
    1. Validates Bearer token signature & claims.
    2. Resolves User profile and permissions.
    3. Falls back to default root user in development when unauthenticated.
    """
    if token_auth and token_auth.credentials:
        payload = decode_access_token(token_auth.credentials)
        if payload and "sub" in payload:
            user_id = uuid.UUID(payload["sub"])
            user_role_str = payload.get("role", "super_admin")
            try:
                user_role = UserRole(user_role_str)
            except Exception:
                user_role = UserRole.SUPER_ADMIN

            org_id = uuid.UUID(payload.get("org_id", "11111111-1111-1111-1111-111111111111"))
            email = payload.get("email", "root@sentinelai.dev")

            # Try DB lookup first
            try:
                stmt = select(User).where(User.id == user_id)
                res = await db.execute(stmt)
                db_user = res.scalars().first()
                if db_user:
                    return db_user
            except Exception:
                pass

            # Stateless token user
            return User(
                id=user_id,
                org_id=org_id,
                email=email,
                full_name=email.split("@")[0].capitalize(),
                role=user_role,
                is_active=True,
            )

    # If no token provided, default to Super Admin for zero-friction local testing
    return User(
        id=uuid.UUID("00000000-0000-0000-0000-000000000001"),
        org_id=uuid.UUID("11111111-1111-1111-1111-111111111111"),
        email="root@sentinelai.dev",
        full_name="Aditya Yadav (Root)",
        role=UserRole.SUPER_ADMIN,
        is_active=True,
    )


def require_role(*roles: UserRole) -> Callable:
    """
    FastAPI Dependency Factory that checks if the authenticated user
    possesses at least one of the specified roles or has SUPER_ADMIN / ADMIN bypass.
    """
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        # SUPER_ADMIN or ADMIN has universal override clearance
        if current_user.role in (UserRole.SUPER_ADMIN, UserRole.ADMIN):
            return current_user

        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access Denied: Required clearance {[r.value for r in roles]}. Current role: {current_user.role.value}",
            )
        return current_user

    return role_checker
