import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, get_db
from app.models.agent import Agent
from app.models.test_run import RunStatus, RunType, TestResult, TestRun
from app.models.user import User
from app.schemas.test_run import TestResultCreate, TestResultResponse, TestRunCreate, TestRunResponse

router = APIRouter(prefix="/test-runs", tags=["Test Runs"])


@router.post("/", response_model=TestRunResponse, status_code=status.HTTP_201_CREATED)
async def create_test_run(
    payload: TestRunCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    agent = await db.get(Agent, payload.agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    test_run = TestRun(
        agent_id=payload.agent_id,
        initiated_by=current_user.id,
        run_type=payload.run_type,
        config=payload.config,
        status=RunStatus.RUNNING,
    )
    db.add(test_run)
    await db.commit()

    stmt = select(TestRun).where(TestRun.id == test_run.id).options(selectinload(TestRun.results))
    result = await db.execute(stmt)
    return result.scalars().first()


@router.get("/", response_model=List[TestRunResponse])
async def list_test_runs(
    agent_id: Optional[uuid.UUID] = None,
    run_type: Optional[RunType] = None,
    status_: Optional[RunStatus] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(TestRun).options(selectinload(TestRun.results))
    if agent_id:
        query = query.where(TestRun.agent_id == agent_id)
    if run_type:
        query = query.where(TestRun.run_type == run_type)
    if status_:
        query = query.where(TestRun.status == status_)
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/{run_id}", response_model=TestRunResponse)
async def get_test_run(run_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    stmt = select(TestRun).where(TestRun.id == run_id).options(selectinload(TestRun.results))
    result = await db.execute(stmt)
    run = result.scalars().first()
    if not run:
        raise HTTPException(status_code=404, detail="Test run not found")
    return run


@router.post("/{run_id}/results", response_model=TestResultResponse, status_code=status.HTTP_201_CREATED)
async def add_test_result(
    run_id: uuid.UUID,
    payload: TestResultCreate,
    db: AsyncSession = Depends(get_db),
):
    test_run = await db.get(TestRun, run_id)
    if not test_run:
        raise HTTPException(status_code=404, detail="Test run not found")

    result = TestResult(
        run_id=run_id,
        test_case=payload.test_case,
        category=payload.category,
        outcome=payload.outcome,
        input_prompt=payload.input_prompt,
        agent_response=payload.agent_response,
        metrics=payload.metrics,
    )
    db.add(result)
    await db.commit()
    await db.refresh(result)
    return result


@router.put("/{run_id}/complete", response_model=TestRunResponse)
async def complete_test_run(
    run_id: uuid.UUID,
    status_: RunStatus = RunStatus.COMPLETED,
    results_summary: Optional[dict] = None,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(TestRun).where(TestRun.id == run_id).options(selectinload(TestRun.results))
    res = await db.execute(stmt)
    test_run = res.scalars().first()
    if not test_run:
        raise HTTPException(status_code=404, detail="Test run not found")

    test_run.status = status_
    test_run.completed_at = datetime.now(timezone.utc)
    if results_summary:
        test_run.results_summary = results_summary

    await db.commit()
    await db.refresh(test_run)
    return test_run

