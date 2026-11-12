import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import (
    agents_router,
    approvals_router,
    audit_router,
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
from app.config import get_settings
from app.database import Base, engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sentinel")
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing SentinelAI Backend Service...")
    # Create tables automatically in development / testing
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database schema validated and ready.")
    yield
    logger.info("Shutting down SentinelAI Backend Service...")
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    description="Enterprise AI Agent Security & Reliability Platform API",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API v1 Router registrations
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


@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "version": "0.1.0",
        "status": "running",
        "docs": "/docs",
    }
