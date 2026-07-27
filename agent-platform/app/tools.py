import json
from collections.abc import Callable
from dataclasses import dataclass
from urllib.error import URLError
from urllib.request import Request, urlopen


@dataclass(frozen=True)
class ToolResult:
    summary: str
    metadata: dict[str, object]


Tool = Callable[[str], ToolResult]


class ToolRegistry:
    def __init__(
        self, ollama_model: str | None = None, ollama_base_url: str = "http://127.0.0.1:11434"
    ) -> None:
        self._tools: dict[str, Tool] = {
            "capability_catalog": self._capability_catalog,
            "response_drafter": OllamaResponseTool(ollama_model, ollama_base_url)
            if ollama_model
            else self._response_drafter,
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


class OllamaResponseTool:
    def __init__(self, model: str, base_url: str) -> None:
        self.model = model
        self.base_url = base_url.rstrip("/")

    def __call__(self, goal: str) -> ToolResult:
        payload = {
            "model": self.model,
            "stream": False,
            "options": {"temperature": 0.2},
            "messages": [
                {
                    "role": "system",
                    "content": "You are a reliable internal agent. Give a concise operational response. State assumptions and do not claim external actions were taken.",
                },
                {"role": "user", "content": goal},
            ],
        }
        request = Request(
            f"{self.base_url}/api/chat",
            data=json.dumps(payload).encode(),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urlopen(request, timeout=120) as response:
                body = json.loads(response.read())
            content = body["message"]["content"].strip()
            if not content:
                raise ValueError("Ollama returned an empty response")
            return ToolResult(
                summary=content,
                metadata={
                    "model": self.model,
                    "provider": "ollama",
                    "fallback": False,
                    "eval_count": body.get("eval_count"),
                },
            )
        except (OSError, URLError, ValueError, KeyError, json.JSONDecodeError) as error:
            return ToolResult(
                summary=f"Local Ollama model was unavailable; deterministic fallback drafted a response for: {goal}",
                metadata={
                    "model": self.model,
                    "provider": "ollama",
                    "fallback": True,
                    "error": str(error),
                },
            )
