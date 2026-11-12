import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict
from app.models.test_run import RunStatus, RunType, TestOutcome


class TestResultCreate(BaseModel):
    test_case: str
    category: str
    outcome: TestOutcome
    input_prompt: str
    agent_response: Optional[str] = None
    metrics: Optional[Dict[str, Any]] = None


class TestResultResponse(TestResultCreate):
    id: uuid.UUID
    run_id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TestRunCreate(BaseModel):
    agent_id: uuid.UUID
    run_type: RunType = RunType.PLAYGROUND
    config: Dict[str, Any] = {}


class TestRunResponse(BaseModel):
    id: uuid.UUID
    agent_id: uuid.UUID
    initiated_by: Optional[uuid.UUID]
    run_type: RunType
    status: RunStatus
    config: Dict[str, Any]
    results_summary: Optional[Dict[str, Any]]
    started_at: datetime
    completed_at: Optional[datetime]
    results: List[TestResultResponse] = []

    model_config = ConfigDict(from_attributes=True)

