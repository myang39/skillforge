# SkillForge

SkillForge turns a job post into a guided, evidence-backed portfolio project. It does not treat autonomous code output as evidence: each project maps job requirements to design, code, tests, CI, deployment artifacts, and user approvals.

## Current MVP

- Parse a job post into a skill/evidence matrix.
- Produce a scoped project blueprint and multi-agent delivery workflow.
- Generate a Codex-ready execution prompt with context, verification, and approval boundaries.
- Preserve approval gates for repository publication, protected-branch merges, and production deployment.
- Run unit tests, linting, and production builds in GitHub Actions.

## Run locally

```bash
npm install
npm run dev
```

## Agent Reliability Gateway

`agent-platform/` is a production-shaped Python reference service for the Agent Platform Engineer job path. It demonstrates a safe, inspectable agent lifecycle: accept a goal, plan an allowlisted tool sequence, act, persist observations, and save an evaluation result.

When Ollama is running locally, the response-drafting tool calls its `/api/chat` endpoint. The service defaults to `gpt-oss`; select another locally installed model per request with the optional `model` field, or set `OLLAMA_MODEL` before starting the service.

```bash
cd agent-platform
python3 -m venv .venv
.venv/bin/python -m pip install -e '.[dev]'
.venv/bin/uvicorn app.main:app --reload
```

Open `http://127.0.0.1:8000/docs` for the OpenAPI UI. Create a run with:

```bash
curl -X POST http://127.0.0.1:8000/v1/runs \
  -H 'Content-Type: application/json' \
  -d '{"goal":"Draft a traceable agent response for an account support request", "model":"llama3.1"}'
```

Verify it with:

```bash
npm run check
cd agent-platform && .venv/bin/ruff check . && .venv/bin/pytest
```

See [the product requirements](docs/agent-platform-prd.md), [architecture](docs/agent-platform-architecture.md), and [evidence matrix](docs/evidence-matrix.md).

### Interview demo narrative

“I built a small Agent Reliability Gateway rather than a chat wrapper. It models the plan/act/observe lifecycle, limits execution to an explicit tool registry, persists ordered traces for operators, and evaluates every completed run. The same seams allow a production model or MCP adapter to replace the deterministic tools without changing the API contract. I packaged the service for Docker and verify it in CI.”

## Product direction

The next slice is a GitHub App integration that turns approved milestones into issues and branches, then has dedicated product, design, builder, reviewer, QA, and DevOps agents generate reviewable artifacts.

## Use with Codex

Paste a job description, generate the blueprint, then use **Copy Codex prompt**. Open a new Codex task in the folder where you want the portfolio project built and paste the prompt. The prompt asks Codex to plan, build, test, review, and document the project without publishing or deploying externally unless you approve it.
