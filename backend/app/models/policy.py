import enum
import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Any, Dict
from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, JSON, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.organization import Organization


class PolicyType(str, enum.Enum):
    INPUT = "input"
    OUTPUT = "output"
    TOOL = "tool"
    RAG = "rag"


class Policy(Base):
    __tablename__ = "policies"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    policy_type: Mapped[PolicyType] = mapped_column(
        Enum(PolicyType, name="policy_type_enum", values_callable=lambda x: [e.value for e in x]),
        nullable=False,
    )
    rules: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    organization: Mapped["Organization"] = relationship("Organization", back_populates="policies")

