import enum
import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Any, Dict, List, Optional
from sqlalchemy import DateTime, Enum, ForeignKey, JSON, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.agent import Agent
    from app.models.user import User


class RunType(str, enum.Enum):
    PLAYGROUND = "playground"
    REDTEAM = "redteam"
    EVALUATION = "evaluation"


class RunStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class TestOutcome(str, enum.Enum):
    PASS = "pass"
    FAIL = "fail"
    ERROR = "error"


class TestRun(Base):
    __tablename__ = "test_runs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("agents.id", ondelete="CASCADE"), nullable=False, index=True
    )
    initiated_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    run_type: Mapped[RunType] = mapped_column(
        Enum(RunType, name="run_type_enum", values_callable=lambda x: [e.value for e in x]),
        default=RunType.PLAYGROUND,
        nullable=False,
    )
    status: Mapped[RunStatus] = mapped_column(
        Enum(RunStatus, name="run_status_enum", values_callable=lambda x: [e.value for e in x]),
        default=RunStatus.PENDING,
        nullable=False,
    )
    config: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    results_summary: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)

    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    agent: Mapped["Agent"] = relationship("Agent", back_populates="test_runs")
    initiator: Mapped[Optional["User"]] = relationship("User")
    results: Mapped[List["TestResult"]] = relationship(
        "TestResult", back_populates="test_run", cascade="all, delete-orphan"
    )


class TestResult(Base):
    __tablename__ = "test_results"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    run_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("test_runs.id", ondelete="CASCADE"), nullable=False, index=True
    )
    test_case: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    outcome: Mapped[TestOutcome] = mapped_column(
        Enum(TestOutcome, name="test_outcome_enum", values_callable=lambda x: [e.value for e in x]),
        default=TestOutcome.PASS,
        nullable=False,
    )
    input_prompt: Mapped[str] = mapped_column(Text, nullable=False)
    agent_response: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metrics: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    test_run: Mapped["TestRun"] = relationship("TestRun", back_populates="results")

