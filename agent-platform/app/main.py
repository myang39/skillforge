import os
from collections.abc import Generator
from contextlib import asynccontextmanager
from uuid import UUID

from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.models import Base
from app.schemas import CreateRunRequest, EvaluationResponse, RunResponse, TraceEventResponse
from app.service import AgentService, RunView

DATABASE_URL = "sqlite:///./agent_gateway.db"
DEFAULT_OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gpt-oss")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(engine)
    yield


app = FastAPI(title="Agent Reliability Gateway", version="0.1.0", lifespan=lifespan)


def get_session() -> Generator[Session, None, None]:
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def serialize(view: RunView) -> RunResponse:
    return RunResponse(
        id=view.run.id,
        goal=view.run.goal,
        status=view.run.status,
        output=view.run.output,
        created_at=view.run.created_at,
        trace=[
            TraceEventResponse(
                sequence=item.sequence, phase=item.phase, name=item.name, payload=item.payload
            )
            for item in view.trace
        ],
        evaluation=EvaluationResponse(
            score=view.evaluation.score,
            passed=view.evaluation.passed,
            signals=view.evaluation.signals,
        ),
    )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/v1/runs", response_model=RunResponse, status_code=status.HTTP_201_CREATED)
def create_run(request: CreateRunRequest, session: Session = Depends(get_session)) -> RunResponse:
    service = AgentService(session, ollama_model=request.model or DEFAULT_OLLAMA_MODEL)
    return serialize(service.create_run(request.goal))


@app.get("/v1/runs/{run_id}", response_model=RunResponse)
def get_run(run_id: UUID, session: Session = Depends(get_session)) -> RunResponse:
    view = AgentService(session).get_run(run_id)
    if view is None:
        raise HTTPException(status_code=404, detail="Run not found")
    return serialize(view)
