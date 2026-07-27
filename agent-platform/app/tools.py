from collections.abc import Callable
from dataclasses import dataclass


@dataclass(frozen=True)
class ToolResult:
    summary: str
    metadata: dict[str, object]


Tool = Callable[[str], ToolResult]


class ToolRegistry:
    def __init__(self) -> None:
        self._tools: dict[str, Tool] = {
            "capability_catalog": self._capability_catalog,
            "response_drafter": self._response_drafter,
        }

    def names(self) -> list[str]:
        return list(self._tools)

    def execute(self, name: str, goal: str) -> ToolResult:
        return self._tools[name](goal)

    @staticmethod
    def _capability_catalog(goal: str) -> ToolResult:
        return ToolResult(
            summary=f"Catalog matched reliable platform capabilities for: {goal}",
            metadata={"matches": ["typed API", "trace storage", "evaluation signals"]},
        )

    @staticmethod
    def _response_drafter(goal: str) -> ToolResult:
        return ToolResult(
            summary=f"Drafted an operator-facing response for: {goal}",
            metadata={"contains_guardrail": True},
        )
