import uuid
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.models.audit_log import AuditLog

router = APIRouter(prefix="/audit", tags=["Audit"])


@router.get("/", response_model=List[Dict[str, Any]])
async def list_audit_logs(
    org_id: Optional[uuid.UUID] = None,
    action: Optional[str] = None,
    resource_type: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    query = select(AuditLog)
    if org_id:
        query = query.where(AuditLog.org_id == org_id)
    if action:
        query = query.where(AuditLog.action == action)
    if resource_type:
        query = query.where(AuditLog.resource_type == resource_type)

    query = query.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    logs = result.scalars().all()
    return [
        {
            "id": str(log.id),
            "org_id": str(log.org_id),
            "user_id": str(log.user_id) if log.user_id else None,
            "agent_id": str(log.agent_id) if log.agent_id else None,
            "action": log.action,
            "resource_type": log.resource_type,
            "resource_id": str(log.resource_id) if log.resource_id else None,
            "details": log.details,
            "ip_address": log.ip_address,
            "created_at": log.created_at.isoformat(),
        }
        for log in logs
    ]


@router.get("/{log_id}")
async def get_audit_log(log_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    log = await db.get(AuditLog, log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Audit log entry not found")
    return {
        "id": str(log.id),
        "org_id": str(log.org_id),
        "user_id": str(log.user_id) if log.user_id else None,
        "agent_id": str(log.agent_id) if log.agent_id else None,
        "action": log.action,
        "resource_type": log.resource_type,
        "resource_id": str(log.resource_id) if log.resource_id else None,
        "details": log.details,
        "ip_address": log.ip_address,
        "created_at": log.created_at.isoformat(),
    }

