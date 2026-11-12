import logging
import uuid
from typing import Any, Dict, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.audit_log import AuditLog

logger = logging.getLogger("sentinel.services.audit")


class AuditService:
    """
    Central service for recording immutable audit log events
    for administrative actions, security violations, and tool approvals.
    """

    @staticmethod
    async def log_event(
        db: AsyncSession,
        org_id: uuid.UUID,
        action: str,
        resource_type: str,
        resource_id: Optional[uuid.UUID] = None,
        user_id: Optional[uuid.UUID] = None,
        agent_id: Optional[uuid.UUID] = None,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
    ) -> AuditLog:
        audit_entry = AuditLog(
            org_id=org_id,
            user_id=user_id,
            agent_id=agent_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details or {},
            ip_address=ip_address,
        )
        db.add(audit_entry)
        await db.commit()
        await db.refresh(audit_entry)
        logger.info(f"Audit event recorded: [{action}] on [{resource_type}] by user={user_id}")
        return audit_entry

