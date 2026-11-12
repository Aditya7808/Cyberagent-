import enum
import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Any, Dict, List, Optional
from sqlalchemy import DateTime, Enum, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.agent import Agent
    from app.models.user import User


class ConversationStatus(str, enum.Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"


class MessageRole(str, enum.Enum):
    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"
    TOOL = "tool"


class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    agent_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("agents.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    title: Mapped[str] = mapped_column(String(255), default="New Conversation")
    status: Mapped[ConversationStatus] = mapped_column(
        Enum(ConversationStatus, name="conv_status_enum", values_callable=lambda x: [e.value for e in x]),
        default=ConversationStatus.ACTIVE,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    agent: Mapped["Agent"] = relationship("Agent")
    user: Mapped[Optional["User"]] = relationship("User")
    messages: Mapped[List["Message"]] = relationship(
        "Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at"
    )


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    role: Mapped[MessageRole] = mapped_column(
        Enum(MessageRole, name="msg_role_enum", values_callable=lambda x: [e.value for e in x]),
        nullable=False,
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    tool_call_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    security_metadata: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, default=dict)
    tokens_used: Mapped[int] = mapped_column(Integer, default=0)
    latency_ms: Mapped[Optional[float]] = mapped_column(nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    conversation: Mapped["Conversation"] = relationship("Conversation", back_populates="messages")
