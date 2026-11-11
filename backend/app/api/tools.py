import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.models.tool import AgentTool
from app.schemas.tool import ToolResponse, ToolUpdate

router = APIRouter(prefix="/tools", tags=["Tools"])


@router.get("/", response_model=List[ToolResponse])
async def list_all_tools(
    agent_id: Optional[uuid.UUID] = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(AgentTool)
    if agent_id:
        query = query.where(AgentTool.agent_id == agent_id)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{tool_id}", response_model=ToolResponse)
async def get_tool(tool_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    tool = await db.get(AgentTool, tool_id)
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    return tool


@router.put("/{tool_id}", response_model=ToolResponse)
async def update_tool(
    tool_id: uuid.UUID,
    payload: ToolUpdate,
    db: AsyncSession = Depends(get_db),
):
    tool = await db.get(AgentTool, tool_id)
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")

    if payload.tool_name is not None:
        tool.tool_name = payload.tool_name
    if payload.description is not None:
        tool.description = payload.description
    if payload.parameters_schema is not None:
        tool.parameters_schema = payload.parameters_schema
    if payload.auth_level is not None:
        tool.auth_level = payload.auth_level
    if payload.enabled is not None:
        tool.enabled = payload.enabled

    await db.commit()
    await db.refresh(tool)
    return tool


@router.delete("/{tool_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tool(tool_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    tool = await db.get(AgentTool, tool_id)
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    await db.delete(tool)
    await db.commit()
