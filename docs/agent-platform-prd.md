# Agent Reliability Gateway — PRD

## Problem

Teams can prototype an LLM interaction quickly but struggle to operate agents that plan, call tools, preserve an audit trail, and demonstrate whether quality regressed.

## Users

- Platform engineers integrating an agent into an internal service.
- Product teams that need reliable, inspectable agent runs.

## MVP

The service accepts a goal, executes a deterministic plan → act → observe loop with an allowlisted tool registry, persists a trace, and evaluates whether the run met operational expectations.

## Success criteria

- An engineer can create and inspect an agent run through documented HTTP endpoints.
- Every run has ordered trace events and a persisted evaluation.
- The service runs locally, in tests, and in a Docker container.

## Non-goals

- Calling a production model provider or handling credentials.
- Autonomous external side effects.
- Multi-tenant identity and production Kubernetes deployment.
