# Job-skill evidence matrix

| Requirement | Evidence in this repository |
| --- | --- |
| Python | Typed FastAPI service and domain layer in `agent-platform/app/` |
| Agent lifecycle / tools | Plan → act → observe state machine and allowlisted tool registry |
| Evaluation / observability | Persisted trace events, evaluator signals, API inspection endpoint |
| SQL / migrations | SQLAlchemy models and `migrations/001_initial.sql` |
| SDK / API design | Versioned REST API, Pydantic schemas, OpenAPI at `/docs` |
| Containers | `agent-platform/Dockerfile` |
| CI/CD | GitHub Actions runs Python and frontend verification |
