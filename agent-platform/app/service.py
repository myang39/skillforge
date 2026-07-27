from __future__ import annotations

from dataclasses import dataclass
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models import AgentRun, Evaluation, TraceEvent
from app.tools import ToolRegistry


@dataclass(frozen=True)
class RunView:
    run: AgentRun
    trace: list[TraceEvent]
    evaluation: Evaluation


class AgentService:
    def __init__(
        self, session: Session, tools: ToolRegistry | None = None, ollama_model: str | None = None
    ) -> None:
        self.session = session
        self.tools = tools or ToolRegistry(ollama_model=ollama_model)

    def create_run(self, goal: str) -> RunView:
        run = AgentRun(goal=goal, status="running", output="")
        self.session.add(run)
        self.session.flush()
        events = [self._event(run.id, 1, "plan", "planned", {"tools": self.tools.names()})]
        observations: list[str] = []

        for index, tool_name in enumerate(self.tools.names(), start=1):
            action_sequence = index * 2
            events.append(self._event(run.id, action_sequence, "act", tool_name, {"goal": goal}))
            result = self.tools.execute(tool_name, goal)
            events.append(
                self._event(
                    run.id,
                    action_sequence + 1,
                    "observe",
                    tool_name,
                    {"summary": result.summary, **result.metadata},
                )
            )
            observations.append(result.summary)

        run.status = "completed"
        run.output = "\n".join(observations)
        evaluation = self._evaluate(run, events)
        self.session.add_all([*events, evaluation])
        self.session.commit()
        self.session.refresh(run)
        return RunView(run, events, evaluation)

    def get_run(self, run_id: UUID) -> RunView | None:
        run = self.session.scalar(
            select(AgentRun)
            .where(AgentRun.id == run_id)
            .options(selectinload(AgentRun.trace_events), selectinload(AgentRun.evaluation))
        )
        if run is None or run.evaluation is None:
            return None
        return RunView(
            run, sorted(run.trace_events, key=lambda event: event.sequence), run.evaluation
        )

    @staticmethod
    def _event(
        run_id: UUID, sequence: int, phase: str, name: str, payload: dict[str, object]
    ) -> TraceEvent:
        return TraceEvent(run_id=run_id, sequence=sequence, phase=phase, name=name, payload=payload)

    @staticmethod
    def _evaluate(run: AgentRun, events: list[TraceEvent]) -> Evaluation:
        has_plan = any(event.phase == "plan" for event in events)
        has_observations = sum(event.phase == "observe" for event in events)
        signals = {
            "has_plan": has_plan,
            "observation_count": has_observations,
            "non_empty_output": bool(run.output),
        }
        score = 100 if has_plan and has_observations >= 2 and run.output else 0
        return Evaluation(run_id=run.id, score=score, passed=score >= 90, signals=signals)
