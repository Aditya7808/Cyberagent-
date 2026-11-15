import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import (
    agents_router,
    approvals_router,
    audit_router,
    auth_router,
    conversations_router,
    documents_router,
    evaluations_router,
    health_router,
    organizations_router,
    policies_router,
    test_runs_router,
    tools_router,
    users_router,
)
import uuid
from sqlalchemy import select
from app.config import get_settings
from app.database import Base, engine, AsyncSessionLocal
from app.models.organization import Organization
from app.models.user import User, UserRole
from app.security.auth_handler import get_password_hash
from app.security.hardening import RateLimitMiddleware, SecurityHeadersMiddleware

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sentinel")
settings = get_settings()


async def init_db_and_seed():
    """Initializes tables and seeds base tenant and root security identities."""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database schema validated and ready.")

        async with AsyncSessionLocal() as session:
            default_org_id = uuid.UUID("11111111-1111-1111-1111-111111111111")
            stmt = select(Organization).where(Organization.id == default_org_id)
            org = (await session.execute(stmt)).scalars().first()
            if not org:
                org = Organization(
                    id=default_org_id,
                    name="Acme Defense Systems",
                    slug="acme-defense",
                    settings={"environment": "production", "enforce_mfa": True},
                )
                session.add(org)
                await session.commit()

            initial_users = [
                (
                    "root@sentinelai.dev",
                    "Aditya Yadav",
                    "SentinelRoot2026!",
                    UserRole.SUPER_ADMIN,
                    "00000000-0000-0000-0000-000000000001",
                ),
                (
                    "dev@sentinelai.dev",
                    "Alex Vance (AI Dev)",
                    "SentinelDev2026!",
                    UserRole.DEVELOPER,
                    "00000000-0000-0000-0000-000000000002",
                ),
                (
                    "auditor@sentinelai.dev",
                    "Elena Rostova (Compliance)",
                    "SentinelAudit2026!",
                    UserRole.AUDITOR,
                    "00000000-0000-0000-0000-000000000003",
                ),
                (
                    "user@sentinelai.dev",
                    "Marcus Kane (Analyst)",
                    "SentinelUser2026!",
                    UserRole.END_USER,
                    "00000000-0000-0000-0000-000000000004",
                ),
            ]

            for email, full_name, password, role, uid in initial_users:
                stmt_u = select(User).where(User.email == email)
                existing = (await session.execute(stmt_u)).scalars().first()
                if not existing:
                    new_user = User(
                        id=uuid.UUID(uid),
                        org_id=default_org_id,
                        email=email,
                        full_name=full_name,
                        hashed_password=get_password_hash(password),
                        role=role,
                        is_active=True,
                    )
                    session.add(new_user)
            await session.commit()
            logger.info("Database security identities successfully verified and seeded.")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing SentinelAI Backend Service...")
    await init_db_and_seed()
    yield
    logger.info("Shutting down SentinelAI Backend Service...")
    try:
        await engine.dispose()
    except Exception:
        pass


app = FastAPI(
    title=settings.APP_NAME,
    description="Enterprise AI Agent Security & Reliability Platform API",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# 1. Security Headers & Rate Limiting Middleware
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware)

# 2. CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. API v1 Router registrations
api_v1_prefix = "/api/v1"
app.include_router(health_router, prefix=api_v1_prefix)
app.include_router(organizations_router, prefix=api_v1_prefix)
app.include_router(users_router, prefix=api_v1_prefix)
app.include_router(agents_router, prefix=api_v1_prefix)
app.include_router(tools_router, prefix=api_v1_prefix)
app.include_router(documents_router, prefix=api_v1_prefix)
app.include_router(test_runs_router, prefix=api_v1_prefix)
app.include_router(evaluations_router, prefix=api_v1_prefix)
app.include_router(audit_router, prefix=api_v1_prefix)
app.include_router(conversations_router, prefix=api_v1_prefix)
app.include_router(policies_router, prefix=api_v1_prefix)
app.include_router(approvals_router, prefix=api_v1_prefix)
app.include_router(auth_router, prefix=api_v1_prefix)


@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "version": "0.1.0",
        "status": "running",
        "environment": "production" if not settings.DEBUG else "development",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": "0.1.0",
    }
