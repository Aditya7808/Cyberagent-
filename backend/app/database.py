import os
import uuid
import logging
from collections.abc import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.types import CHAR, TypeDecorator
from app.config import get_settings

logger = logging.getLogger("sentinel.database")
settings = get_settings()

db_url = settings.DATABASE_URL
sqlite_file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "sentinel.db"))
sqlite_url = f"sqlite+aiosqlite:///{sqlite_file_path}"

# Default to SQLite for stable zero-config local persistence if PostgreSQL isn't explicitly configured remotely
if os.getenv("USE_SQLITE", "true").lower() in ("true", "1") or "localhost:5432" in db_url:
    effective_url = sqlite_url
    logger.info(f"SentinelAI DB: Using persistent SQLite database at: {sqlite_file_path}")
else:
    effective_url = db_url

engine = create_async_engine(
    effective_url,
    echo=settings.DEBUG,
    future=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


class GUID(TypeDecorator):
    """Platform-independent GUID/UUID type.
    Uses CHAR(36) to ensure consistent string storage across SQLite and Postgres.
    """
    impl = CHAR(36)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif isinstance(value, uuid.UUID):
            return str(value)
        else:
            return str(uuid.UUID(str(value)))

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        if isinstance(value, uuid.UUID):
            return value
        return uuid.UUID(str(value))


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
