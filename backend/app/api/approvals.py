import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db, require_role
from app.models.approval import ApprovalStatus, ToolApproval
from app.models.user import User, UserRole
from app.schemas.approval import (
    ToolApprovalCreate,
    ToolApprovalResolve,
    ToolApprovalResponse,
)
from app.services.audit_service import AuditService
from app.tools.executor import ToolExecutor
from app.tools.registry import create_default_registry

router = APIRouter(prefix="/approvals", tags=["Approvals"])
default_registry = create_default_registry()
tool_executor = ToolExecutor(default_registry)


@router.post("/", response_model=ToolApprovalResponse, status_code=status.HTTP_201_CREATED)
async def create_tool_approval(
    payload: ToolApprovalCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    approval = ToolApproval(
        org_id=current_user.org_id,
        agent_id=payload.agent_id,
        conversation_id=payload.conversation_id,
        tool_name=payload.tool_name,
        parameters=payload.parameters,
        status=ApprovalStatus.PENDING,
        requested_by=current_user.id,
    )
    db.add(approval)
    await db.commit()
    await db.refresh(approval)

    # Log audit event
    await AuditService.log_event(
        db=db,
        org_id=current_user.org_id,
        user_id=current_user.id,
        agent_id=payload.agent_id,
        action="tool.approval_requested",
        resource_type="tool_approval",
        resource_id=approval.id,
        details={
            "tool_name": payload.tool_name,
            "parameters": payload.parameters,
        },
    )

    return approval


@router.get("/", response_model=List[ToolApprovalResponse])
async def list_tool_approvals(
    status_filter: Optional[ApprovalStatus] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        select(ToolApproval)
        .where(ToolApproval.org_id == current_user.org_id)
        .order_by(ToolApproval.created_at.desc())
    )
    if status_filter:
        query = query.where(ToolApproval.status == status_filter)

    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/{approval_id}", response_model=ToolApprovalResponse)
async def get_tool_approval(
    approval_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    approval = await db.get(ToolApproval, approval_id)
    if not approval or approval.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Approval request not found")
    return approval


@router.post("/{approval_id}/resolve", response_model=ToolApprovalResponse)
async def resolve_tool_approval(
    approval_id: uuid.UUID,
    payload: ToolApprovalResolve,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.OPERATOR)),
):
    approval = await db.get(ToolApproval, approval_id)
    if not approval or approval.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Approval request not found")

    if approval.status != ApprovalStatus.PENDING:
        raise HTTPException(status_code=400, detail=f"Approval request is already {approval.status.value}")

    new_status = ApprovalStatus.APPROVED if payload.approved else ApprovalStatus.REJECTED
    approval.status = new_status
    approval.reviewed_by = current_user.id
    approval.review_comment = payload.review_comment
    approval.resolved_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(approval)

    # Log audit event
    action = "tool.approved" if payload.approved else "tool.rejected"
    await AuditService.log_event(
        db=db,
        org_id=current_user.org_id,
        user_id=current_user.id,
        agent_id=approval.agent_id,
        action=action,
        resource_type="tool_approval",
        resource_id=approval.id,
        details={
            "tool_name": approval.tool_name,
            "comment": payload.review_comment,
            "decision": new_status.value,
        },
    )

    return approval
