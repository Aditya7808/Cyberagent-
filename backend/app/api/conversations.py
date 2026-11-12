import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, get_db
from app.models.agent import Agent
from app.models.conversation import Conversation, ConversationStatus, Message, MessageRole
from app.models.user import User
from app.orchestrator.runner import run_agent
from app.orchestrator.state import AgentMessage
from app.schemas.conversation import (
    ConversationCreate,
    ConversationResponse,
    MessageCreate,
    MessageResponse,
)

router = APIRouter(prefix="/conversations", tags=["Conversations"])


@router.post("/", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    payload: ConversationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    agent = await db.get(Agent, payload.agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    conversation = Conversation(
        org_id=agent.org_id,
        agent_id=payload.agent_id,
        user_id=current_user.id,
        title=payload.title or f"Chat with {agent.name}",
        status=ConversationStatus.ACTIVE,
    )
    db.add(conversation)
    await db.commit()
    await db.refresh(conversation)

    # Return with empty messages array
    stmt = (
        select(Conversation)
        .where(Conversation.id == conversation.id)
        .options(selectinload(Conversation.messages))
    )
    res = await db.execute(stmt)
    return res.scalars().first()


@router.get("/", response_model=List[ConversationResponse])
async def list_conversations(
    agent_id: Optional[uuid.UUID] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        select(Conversation)
        .where(Conversation.org_id == current_user.org_id)
        .options(selectinload(Conversation.messages))
        .order_by(Conversation.updated_at.desc())
    )
    if agent_id:
        query = query.where(Conversation.agent_id == agent_id)

    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Conversation)
        .where(Conversation.id == conversation_id)
        .options(selectinload(Conversation.messages))
    )
    result = await db.execute(stmt)
    conversation = result.scalars().first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@router.post("/{conversation_id}/messages", response_model=MessageResponse)
async def send_message(
    conversation_id: uuid.UUID,
    payload: MessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Sends a message to the agent, executes the full LangGraph pipeline
    with input/output security and tool execution, and persists the turn.
    """
    stmt = (
        select(Conversation)
        .where(Conversation.id == conversation_id)
        .options(selectinload(Conversation.messages))
    )
    res = await db.execute(stmt)
    conv = res.scalars().first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    agent = await db.get(Agent, conv.agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Bound agent not found")

    # Record User Message
    user_msg = Message(
        conversation_id=conversation_id,
        role=MessageRole.USER,
        content=payload.content,
    )
    db.add(user_msg)
    await db.flush()

    # Build history for runner
    history: List[AgentMessage] = [
        {"role": m.role.value, "content": m.content}
        for m in conv.messages
    ]

    # Run LangGraph Orchestrator
    agent_result = await run_agent(
        agent_id=str(agent.id),
        prompt=payload.content,
        org_id=str(conv.org_id),
        user_id=str(current_user.id),
        model_id=agent.model_id,
        system_prompt=agent.system_prompt,
        history=history,
    )

    # Record Assistant Response with full security metadata
    security_meta = {
        "is_blocked": agent_result.get("is_blocked", False),
        "block_reason": agent_result.get("block_reason"),
        "requires_human_approval": agent_result.get("requires_human_approval", False),
        "input_security": agent_result.get("input_security"),
        "output_security": agent_result.get("output_security"),
        "tool_results": agent_result.get("tool_results"),
    }

    assistant_msg = Message(
        conversation_id=conversation_id,
        role=MessageRole.ASSISTANT,
        content=agent_result.get("content", ""),
        security_metadata=security_meta,
        tokens_used=agent_result.get("tokens", {}).get("output", 0),
        latency_ms=agent_result.get("latency_ms", 0.0),
    )
    db.add(assistant_msg)
    await db.commit()
    await db.refresh(assistant_msg)

    return assistant_msg


@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    conv = await db.get(Conversation, conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    await db.delete(conv)
    await db.commit()
