import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, get_db
from app.models.agent import Agent, AgentStatus
from app.models.organization import Organization
from app.models.tool import AgentTool
from app.models.user import User
from app.schemas.agent import AgentCreate, AgentResponse, AgentUpdate
from app.schemas.tool import ToolCreate, ToolResponse

router = APIRouter(prefix="/agents", tags=["Agents"])


@router.post("/", response_model=AgentResponse, status_code=status.HTTP_201_CREATED)
async def create_agent(
    payload: AgentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    org = await db.get(Organization, payload.org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    agent = Agent(
        org_id=payload.org_id,
        created_by=current_user.id,
        name=payload.name,
        model_id=payload.model_id,
        system_prompt=payload.system_prompt,
        config=payload.config,
        status=payload.status,
    )
    db.add(agent)
    await db.commit()

    # Re-fetch with tools
    stmt = select(Agent).where(Agent.id == agent.id).options(selectinload(Agent.tools))
    res = await db.execute(stmt)
    return res.scalars().first()


@router.get("/", response_model=List[AgentResponse])
async def list_agents(
    org_id: Optional[uuid.UUID] = None,
    status_: Optional[AgentStatus] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(Agent).options(selectinload(Agent.tools))
    if org_id:
        query = query.where(Agent.org_id == org_id)
    if status_:
        query = query.where(Agent.status == status_)
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(agent_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    stmt = select(Agent).where(Agent.id == agent_id).options(selectinload(Agent.tools))
    res = await db.execute(stmt)
    agent = res.scalars().first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.put("/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: uuid.UUID,
    payload: AgentUpdate,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Agent).where(Agent.id == agent_id).options(selectinload(Agent.tools))
    res = await db.execute(stmt)
    agent = res.scalars().first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    if payload.name is not None:
        agent.name = payload.name
    if payload.model_id is not None:
        agent.model_id = payload.model_id
    if payload.system_prompt is not None:
        agent.system_prompt = payload.system_prompt
    if payload.config is not None:
        agent.config = payload.config
    if payload.status is not None:
        agent.status = payload.status

    await db.commit()
    await db.refresh(agent)
    return agent


@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent(agent_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    agent = await db.get(Agent, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    agent.status = AgentStatus.ARCHIVED
    await db.commit()


@router.post("/{agent_id}/tools", response_model=ToolResponse, status_code=status.HTTP_201_CREATED)
async def add_tool_to_agent(
    agent_id: uuid.UUID,
    payload: ToolCreate,
    db: AsyncSession = Depends(get_db),
):
    agent = await db.get(Agent, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    tool = AgentTool(
        agent_id=agent_id,
        tool_name=payload.tool_name,
        description=payload.description,
        parameters_schema=payload.parameters_schema,
        auth_level=payload.auth_level,
        enabled=payload.enabled,
    )
    db.add(tool)
    await db.commit()
    await db.refresh(tool)
    return tool


@router.get("/{agent_id}/tools", response_model=List[ToolResponse])
async def list_agent_tools(agent_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    agent = await db.get(Agent, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    result = await db.execute(select(AgentTool).where(AgentTool.agent_id == agent_id))
    return result.scalars().all()

