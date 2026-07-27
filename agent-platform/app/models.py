from __future__ import annotations

from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class AgentRun(Base):
    __tablename__ = "agent_runs"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    goal: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(32), default="completed")
    output: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    trace_events: Mapped[list[TraceEvent]] = relationship(
        back_populates="run", cascade="all, delete-orphan"
    )
    evaluation: Mapped[Evaluation | None] = relationship(
        back_populates="run", cascade="all, delete-orphan"
    )


class TraceEvent(Base):
    __tablename__ = "trace_events"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    run_id: Mapped[UUID] = mapped_column(ForeignKey("agent_runs.id"))
    sequence: Mapped[int] = mapped_column(Integer)
    phase: Mapped[str] = mapped_column(String(32))
    name: Mapped[str] = mapped_column(String(128))
    payload: Mapped[dict[str, object]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    run: Mapped[AgentRun] = relationship(back_populates="trace_events")


class Evaluation(Base):
    __tablename__ = "evaluations"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    run_id: Mapped[UUID] = mapped_column(ForeignKey("agent_runs.id"), unique=True)
    score: Mapped[int] = mapped_column(Integer)
    passed: Mapped[bool] = mapped_column()
    signals: Mapped[dict[str, object]] = mapped_column(JSON)
    run: Mapped[AgentRun] = relationship(back_populates="evaluation")
