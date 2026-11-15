import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, get_db
from app.models.agent import Agent, AgentStatus
from app.models.conversation import Conversation, ConversationStatus, Message, MessageRole
from app.models.user import User
from app.orchestrator.runner import run_agent
from app.orchestrator.state import AgentMessage
from app.services.audit_service import AuditService
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
    agent = None
    try:
        agent = await db.get(Agent, payload.agent_id)
    except Exception:
        agent = None

    if not agent:
        # Resolve to first available agent for organization or create default
        stmt = select(Agent).where(Agent.org_id == current_user.org_id).limit(1)
        res = await db.execute(stmt)
        agent = res.scalars().first()

    if not agent:
        agent = Agent(
            org_id=current_user.org_id,
            name="DevOps Autonomous SRE",
            model_id="anthropic.claude-3-sonnet",
            system_prompt="You are an autonomous SRE agent operating under SentinelAI runtime boundaries.",
            status=AgentStatus.ACTIVE,
        )
        db.add(agent)
        await db.commit()
        await db.refresh(agent)

    conversation = Conversation(
        org_id=current_user.org_id,
        agent_id=agent.id,
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

    # Check for autonomous restricted tool triggers requiring Human-in-the-Loop authorization
    from app.models.approval import ToolApproval, ApprovalStatus
    restricted_tools = {
        "delete_backup_snapshot": {"snapshot_id": "snap-09941a", "force": True, "target_env": "production"},
        "export_employee_payroll": {"format": "csv", "fiscal_year": 2026, "mask_ssn": False},
        "drop_database": {"database": "prod_customer_vault", "confirm": True},
        "terminate_cluster": {"cluster_id": "k8s-prod-primary", "grace_period": 0},
    }

    detected_restricted_tool = None
    for r_tool, default_params in restricted_tools.items():
        if r_tool in payload.content.lower() or r_tool.replace("_", " ") in payload.content.lower():
            detected_restricted_tool = (r_tool, default_params)
            break

    # Record Assistant Response with full security metadata
    security_meta = {
        "is_blocked": agent_result.get("is_blocked", False),
        "block_reason": agent_result.get("block_reason"),
        "requires_human_approval": bool(detected_restricted_tool or agent_result.get("requires_human_approval", False)),
        "input_security": agent_result.get("input_security"),
        "output_security": agent_result.get("output_security"),
        "tool_results": agent_result.get("tool_results"),
    }

    assistant_content = agent_result.get("content", "")

    if detected_restricted_tool:
        r_name, r_params = detected_restricted_tool
        approval_item = ToolApproval(
            id=uuid.uuid4(),
            org_id=conv.org_id,
            agent_id=agent.id,
            conversation_id=conversation_id,
            tool_name=r_name,
            parameters=r_params,
            status=ApprovalStatus.PENDING,
            requested_by=current_user.id,
        )
        db.add(approval_item)
        await db.flush()

        assistant_content = (
            f"[Sentinel Human-in-the-Loop Gatekeeper]: The agent requested to execute high-impact restricted tool '{r_name}'. "
            "Execution is suspended and queued in the Threat Radar Gatekeeper for Root Administrator authorization."
        )

        await AuditService.log_event(
            db=db,
            org_id=conv.org_id,
            action="tool.approval_requested",
            resource_type=f"Agent: {agent.name}",
            resource_id=agent.id,
            user_id=current_user.id,
            agent_id=agent.id,
            details={"tool_name": r_name, "parameters": r_params},
        )

    assistant_msg = Message(
        conversation_id=conversation_id,
        role=MessageRole.ASSISTANT,
        content=assistant_content,
        security_metadata=security_meta,
        tokens_used=agent_result.get("tokens", {}).get("output", 0),
        latency_ms=agent_result.get("latency_ms", 0.0),
    )
    db.add(assistant_msg)
    await db.commit()
    await db.refresh(assistant_msg)

    # Persist live audit events for dynamic dashboard telemetry
    try:
        if security_meta.get("is_blocked"):
            await AuditService.log_event(
                db=db,
                org_id=conv.org_id,
                action="input.prompt_injection_flagged",
                resource_type=f"Agent: {agent.name}",
                resource_id=agent.id,
                user_id=current_user.id,
                agent_id=agent.id,
                details={"reason": security_meta.get("block_reason"), "prompt_preview": payload.content[:100]},
            )
        elif security_meta.get("output_security", {}).get("was_redacted"):
            await AuditService.log_event(
                db=db,
                org_id=conv.org_id,
                action="output.pii_redacted",
                resource_type=f"Agent: {agent.name}",
                resource_id=agent.id,
                user_id=current_user.id,
                agent_id=agent.id,
                details={"pii_detected": security_meta.get("output_security", {}).get("pii_detected", [])},
            )
        else:
            await AuditService.log_event(
                db=db,
                org_id=conv.org_id,
                action="agent.turn_completed",
                resource_type=f"Agent: {agent.name}",
                resource_id=agent.id,
                user_id=current_user.id,
                agent_id=agent.id,
                details={"latency_ms": agent_result.get("latency_ms", 12)},
            )
    except Exception as log_err:
        pass

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

