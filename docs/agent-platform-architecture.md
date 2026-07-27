# Architecture

```text
FastAPI API → AgentService → ToolRegistry
                  │              │
                  │              └─ allowlisted deterministic tools
                  ├─ SQLAlchemy repository → SQLite/PostgreSQL-compatible schema
                  └─ Evaluator → trace and output quality signals
```

`AgentService` owns the plan/act/observe state machine. Tools are injected through `ToolRegistry`, so an adapter for an LLM SDK, MCP client, or remote tool can be added without changing the HTTP layer. The MVP registers only local, side-effect-free tools.

The database records `agent_runs`, ordered `trace_events`, and `evaluations`. The schema is created through versioned SQL files in `agent-platform/migrations/`; this keeps the migration path visible and portable to PostgreSQL.

## User flow

1. A developer posts a goal to `POST /v1/runs`.
2. The service creates a run, records a `planned` event, and executes each allowlisted tool.
3. Each tool action and observation is persisted in the trace.
4. The evaluator persists a score and pass/fail signals.
5. The developer reads the run and trace through `GET /v1/runs/{run_id}`.
