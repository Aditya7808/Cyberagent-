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

            from app.models.agent import Agent, AgentStatus
            from sqlalchemy import func
            stmt_all_agents = select(func.count(Agent.id)).where(Agent.org_id == default_org_id)
            existing_agent_count = (await session.execute(stmt_all_agents)).scalar() or 0
            if existing_agent_count == 0:
                initial_agents = [
                    ("DevOps Autonomous SRE", "anthropic.claude-3-sonnet", "You are an autonomous SRE agent operating under SentinelAI runtime boundaries."),
                    ("Financial Advisory Agent", "anthropic.claude-3-sonnet", "You are an enterprise financial risk analyst operating under strict PII controls."),
                    ("Customer Support Tier-2", "anthropic.claude-3-haiku", "You are a customer support agent with least privilege document access."),
                ]
                for ag_name, model, sp in initial_agents:
                    session.add(Agent(
                        id=uuid.uuid4(),
                        org_id=default_org_id,
                        name=ag_name,
                        model_id=model,
                        system_prompt=sp,
                        status=AgentStatus.ACTIVE,
                    ))
                await session.commit()

            # Seed initial high-risk pending tool actions for Privilege Escalation & Gatekeeper testing
            from app.models.approval import ToolApproval, ApprovalStatus
            stmt_approvals = select(func.count(ToolApproval.id)).where(ToolApproval.status == ApprovalStatus.PENDING)
            existing_approvals = (await session.execute(stmt_approvals)).scalar() or 0
            if existing_approvals == 0:
                sre_agent = (await session.execute(select(Agent).where(Agent.name == "DevOps Autonomous SRE"))).scalars().first()
                fin_agent = (await session.execute(select(Agent).where(Agent.name == "Financial Advisory Agent"))).scalars().first()
                if sre_agent:
                    session.add(ToolApproval(
                        id=uuid.uuid4(),
                        org_id=default_org_id,
                        agent_id=sre_agent.id,
                        tool_name="delete_backup_snapshot",
                        parameters={"snapshot_id": "snap-09941a", "force": True, "target_env": "production"},
                        status=ApprovalStatus.PENDING,
                        requested_by=uuid.UUID("00000000-0000-0000-0000-000000000001"),
                    ))
                if fin_agent:
                    session.add(ToolApproval(
                        id=uuid.uuid4(),
                        org_id=default_org_id,
                        agent_id=fin_agent.id,
                        tool_name="export_employee_payroll",
                        parameters={"format": "csv", "fiscal_year": 2026, "mask_ssn": False},
                        status=ApprovalStatus.PENDING,
                        requested_by=uuid.UUID("00000000-0000-0000-0000-000000000001"),
                    ))
                await session.commit()
            logger.info("Database security identities, agents, and gatekeeper approvals successfully verified and seeded.")
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
