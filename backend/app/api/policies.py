import uuid
from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db, require_role
from app.models.policy import Policy, PolicyType
from app.models.user import User, UserRole
from app.schemas.policy import PolicyCreate, PolicyResponse, PolicyUpdate
from app.security.scanner import AdversarialScanner

router = APIRouter(prefix="/policies", tags=["Policies"])
scanner = AdversarialScanner()


@router.post("/", response_model=PolicyResponse, status_code=status.HTTP_201_CREATED)
async def create_policy(
    payload: PolicyCreate,
    db: AsyncSession = Depends(get_db),
    _user=Depends(require_role(UserRole.ADMIN)),
):
    policy = Policy(
        org_id=payload.org_id,
        name=payload.name,
        policy_type=payload.policy_type,
        rules=payload.rules,
        enabled=payload.enabled,
    )
    db.add(policy)
    await db.commit()
    await db.refresh(policy)
    return policy


@router.get("/", response_model=List[PolicyResponse])
async def list_policies(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Policy).where(Policy.org_id == current_user.org_id)
    )
    return result.scalars().all()


@router.get("/{policy_id}", response_model=PolicyResponse)
async def get_policy(
    policy_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    policy = await db.get(Policy, policy_id)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return policy


@router.put("/{policy_id}", response_model=PolicyResponse)
async def update_policy(
    policy_id: uuid.UUID,
    payload: PolicyUpdate,
    db: AsyncSession = Depends(get_db),
    _user=Depends(require_role(UserRole.ADMIN)),
):
    policy = await db.get(Policy, policy_id)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    if payload.name is not None:
        policy.name = payload.name
    if payload.rules is not None:
        policy.rules = payload.rules
    if payload.enabled is not None:
        policy.enabled = payload.enabled

    await db.commit()
    await db.refresh(policy)
    return policy


@router.delete("/{policy_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_policy(
    policy_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _user=Depends(require_role(UserRole.ADMIN)),
):
    policy = await db.get(Policy, policy_id)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    await db.delete(policy)
    await db.commit()


@router.post("/scan/adversarial", response_model=Dict[str, Any])
async def trigger_adversarial_scan(
    _user=Depends(get_current_user),
):
    """
    Executes the versioned red-team attack suite against the security layer
    and returns comprehensive metrics (ASR, Block Rate, False Positives).
    """
    scan_report = scanner.run_scan()
    return scan_report
