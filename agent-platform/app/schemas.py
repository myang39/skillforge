from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class CreateRunRequest(BaseModel):
    goal: str = Field(min_length=8, max_length=4_000)
    model: str | None = Field(default=None, min_length=1, max_length=128)


class TraceEventResponse(BaseModel):
    sequence: int
    phase: str
    name: str
    payload: dict[str, object]


class EvaluationResponse(BaseModel):
    score: int
    passed: bool
    signals: dict[str, object]


class RunResponse(BaseModel):
    id: UUID
    goal: str
    status: str
    output: str
    created_at: datetime
    trace: list[TraceEventResponse]
    evaluation: EvaluationResponse
