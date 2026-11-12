import enum
import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Any, Dict, Optional
from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, JSON, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.agent import Agent


class ToolAuthLevel(str, enum.Enum):
    OPEN = "open"
    RESTRICTED = "restricted"
    APPROVAL_REQUIRED = "approval_required"


class AgentTool(Base):
    __tablename__ = "agent_tools"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("agents.id", ondelete="CASCADE"), nullable=False, index=True
    )
    tool_name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    parameters_schema: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    auth_level: Mapped[ToolAuthLevel] = mapped_column(
        Enum(ToolAuthLevel, name="tool_auth_level_enum", values_callable=lambda x: [e.value for e in x]),
        default=ToolAuthLevel.OPEN,
        nullable=False,
    )
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    agent: Mapped["Agent"] = relationship("Agent", back_populates="tools")

