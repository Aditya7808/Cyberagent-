import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, require_role
from app.models.organization import Organization
from app.models.user import UserRole
from app.schemas.organization import OrgCreate, OrgResponse, OrgUpdate

router = APIRouter(prefix="/organizations", tags=["Organizations"])


@router.post("/", response_model=OrgResponse, status_code=status.HTTP_201_CREATED)
async def create_organization(
    payload: OrgCreate,
    db: AsyncSession = Depends(get_db),
    _user=Depends(require_role(UserRole.ADMIN)),
):
    existing = await db.execute(select(Organization).where(Organization.slug == payload.slug))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Organization slug already exists")

    org = Organization(
        name=payload.name,
        slug=payload.slug,
        settings=payload.settings,
    )
    db.add(org)
    await db.commit()
    await db.refresh(org)
    return org


@router.get("/", response_model=List[OrgResponse])
async def list_organizations(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Organization).offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/{org_id}", response_model=OrgResponse)
async def get_organization(org_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    org = await db.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org


@router.put("/{org_id}", response_model=OrgResponse)
async def update_organization(
    org_id: uuid.UUID,
    payload: OrgUpdate,
    db: AsyncSession = Depends(get_db),
    _user=Depends(require_role(UserRole.ADMIN)),
):
    org = await db.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    if payload.name is not None:
        org.name = payload.name
    if payload.settings is not None:
        org.settings = payload.settings

    await db.commit()
    await db.refresh(org)
    return org


@router.delete("/{org_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_organization(
    org_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _user=Depends(require_role(UserRole.ADMIN)),
):
    org = await db.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    await db.delete(org)
    await db.commit()
