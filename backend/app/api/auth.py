import uuid
import secrets
from typing import List, Optional
import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.organization import Organization
from app.models.user import User, UserRole
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    GoogleAuthRequest,
    TokenResponse,
    UserProfileResponse,
    UserRoleUpdateRequest,
    UserListItemResponse,
)
from app.security.auth_handler import (
    create_access_token,
    get_password_hash,
    verify_password,
)
from app.security.rbac import get_clearance_level, get_role_permissions
from app.api.deps import get_current_user, require_role

router = APIRouter(prefix="/auth", tags=["Authentication & Identity"])

DEFAULT_ORG_ID = uuid.UUID("11111111-1111-1111-1111-111111111111")


def build_profile_and_token(user: User) -> TokenResponse:
    perms = get_role_permissions(user.role)
    clearance = get_clearance_level(user.role)

    token_data = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role.value if hasattr(user.role, "value") else str(user.role),
        "org_id": str(user.org_id),
        "clearance": clearance,
    }
    access_token = create_access_token(token_data)

    profile = UserProfileResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        org_id=user.org_id,
        clearance_level=clearance,
        permissions=perms,
        created_at=user.created_at,
    )

    return TokenResponse(access_token=access_token, user=profile)


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """
    Dynamic User Registration:
    Registers a new user into the database with a bcrypt hashed password.
    Defaults to END_USER (Level 1 Clearance) for zero-trust security.
    """
    email_clean = req.email.lower().strip()

    # 1. Check if user already exists
    stmt = select(User).where(User.email == email_clean)
    result = await db.execute(stmt)
    if result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"An account with email '{email_clean}' already exists.",
        )

    # 2. Ensure default organization exists
    org_stmt = select(Organization).where(Organization.id == DEFAULT_ORG_ID)
    org_res = await db.execute(org_stmt)
    org = org_res.scalars().first()
    if not org:
        org = Organization(
            id=DEFAULT_ORG_ID,
            name="Acme Defense Systems",
            slug="acme-defense",
            settings={"environment": "production"},
        )
        db.add(org)
        await db.commit()

    # 3. Create persistent user in database
    new_user = User(
        id=uuid.uuid4(),
        org_id=DEFAULT_ORG_ID,
        email=email_clean,
        full_name=req.full_name.strip(),
        hashed_password=get_password_hash(req.password),
        role=req.role or UserRole.END_USER,
        is_active=True,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return build_profile_and_token(new_user)


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Dynamic Enterprise Login:
    Authenticates user credentials against the persistent database.
    """
    email_clean = req.email.lower().strip()

    stmt = select(User).where(User.email == email_clean)
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account not found. Please register or verify your credentials.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated by Root Security Administrator.",
        )

    if not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password. Access denied.",
        )

    return build_profile_and_token(user)


@router.post("/google", response_model=TokenResponse)
async def google_auth(req: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    """
    Real Google OAuth 2.0 / OpenID Connect Authentication:
    1. Validates Google credentials (ID Token or Access Token) directly with Google servers.
    2. Retrieves verified user identity (email, full name).
    3. Finds or automatically provisions user in Sentinel database.
    4. Issues cryptographic HS256 JWT access token with role clearance.
    """
    email: Optional[str] = None
    full_name: Optional[str] = None

    if req.credential:
        # Validate Google ID Token with Google OAuth2 API
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(
                    "https://oauth2.googleapis.com/tokeninfo",
                    params={"id_token": req.credential},
                )
                if resp.status_code == 200:
                    info = resp.json()
                    email = info.get("email")
                    full_name = info.get("name") or info.get("given_name")
                    is_verified = str(info.get("email_verified", "")).lower() in ("true", "1")
                    if not is_verified:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Google account email is not verified by Google.",
                        )
                else:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid Google credentials. Token verification failed with Google servers.",
                    )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Google authentication service error: {str(e)}",
            )
    elif req.access_token:
        # Validate Google Access Token with UserInfo API
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    headers={"Authorization": f"Bearer {req.access_token}"},
                )
                if resp.status_code == 200:
                    info = resp.json()
                    email = info.get("email")
                    full_name = info.get("name")
                else:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid Google OAuth access token. Verification failed with Google servers.",
                    )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Google UserInfo service error: {str(e)}",
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Google authentication token. Genuine Google OAuth token required.",
        )

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not retrieve verified email from Google.",
        )

    email_clean = email.lower().strip()

    # Look up existing user in persistent database
    stmt = select(User).where(User.email == email_clean)
    result = await db.execute(stmt)
    user = result.scalars().first()

    if user:
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account has been deactivated by Root Security Administrator.",
            )
        if full_name and not user.full_name:
            user.full_name = full_name
            await db.commit()
            await db.refresh(user)
        return build_profile_and_token(user)

    # Provision new user in database
    org_stmt = select(Organization).where(Organization.id == DEFAULT_ORG_ID)
    org_res = await db.execute(org_stmt)
    org = org_res.scalars().first()
    if not org:
        org = Organization(
            id=DEFAULT_ORG_ID,
            name="Acme Defense Systems",
            slug="acme-defense",
            settings={"environment": "production"},
        )
        db.add(org)
        await db.commit()

    # Role assignment: Root admin emails get SUPER_ADMIN, others get DEVELOPER
    assigned_role = UserRole.DEVELOPER
    if "admin" in email_clean or "root" in email_clean:
        assigned_role = UserRole.SUPER_ADMIN

    new_user = User(
        id=uuid.uuid4(),
        org_id=DEFAULT_ORG_ID,
        email=email_clean,
        full_name=full_name or email_clean.split("@")[0].capitalize(),
        hashed_password=get_password_hash(secrets.token_urlsafe(32)),
        role=assigned_role,
        is_active=True,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return build_profile_and_token(new_user)



@router.get("/me", response_model=UserProfileResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Returns the authenticated user profile, clearance level, and permissions."""
    return UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        org_id=current_user.org_id,
        clearance_level=get_clearance_level(current_user.role),
        permissions=get_role_permissions(current_user.role),
        created_at=current_user.created_at,
    )


@router.get("/users", response_model=List[UserListItemResponse])
async def list_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.SUPER_ADMIN, UserRole.ADMIN)),
):
    """
    Identity & Access Management Console:
    Lists all registered users dynamically from the database.
    Restricted to Level 5 Root Security Administrators.
    """
    stmt = select(User).order_by(User.created_at.desc())
    result = await db.execute(stmt)
    users = result.scalars().all()

    return [
        UserListItemResponse(
            id=u.id,
            email=u.email,
            full_name=u.full_name,
            role=u.role,
            clearance_level=get_clearance_level(u.role),
            is_active=u.is_active,
            created_at=u.created_at,
        )
        for u in users
    ]


@router.patch("/users/{user_id}/role", response_model=UserListItemResponse)
async def update_user_role(
    user_id: uuid.UUID,
    req: UserRoleUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.SUPER_ADMIN)),
):
    """
    Dynamic Privilege Promotion / Demotion:
    Allows Level 5 Root Security Administrator to alter any user's clearance level.
    """
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    target_user = result.scalars().first()

    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    target_user.role = req.role
    await db.commit()
    await db.refresh(target_user)

    return UserListItemResponse(
        id=target_user.id,
        email=target_user.email,
        full_name=target_user.full_name,
        role=target_user.role,
        clearance_level=get_clearance_level(target_user.role),
        is_active=target_user.is_active,
        created_at=target_user.created_at,
    )


@router.delete("/users/{user_id}", status_code=status.HTTP_200_OK)
async def delete_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.SUPER_ADMIN)),
):
    """
    Deactivates/Revokes a user identity in the database.
    """
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Root Administrator cannot revoke own identity.",
        )

    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    target_user = result.scalars().first()

    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    await db.delete(target_user)
    await db.commit()

    return {"status": "REVOKED", "user_id": str(user_id)}


@router.post("/impersonate", response_model=TokenResponse)
async def impersonate_role(
    req: UserRoleUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.SUPER_ADMIN)),
):
    """
    Authorized Role Auditing:
    Strictly restricted to Level 5 Root Security Administrators.
    Non-super-admins cannot impersonate or elevate privileges.
    """
    stmt = select(User).where(User.role == req.role).limit(1)
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No user found matching requested clearance tier.")

    return build_profile_and_token(user)
