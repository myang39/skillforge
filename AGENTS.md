# SkillForge agent guidance

SkillForge converts a job description into a scoped, evidence-backed portfolio-project blueprint and a prompt that a user can hand to Codex. `agent-platform/` is a separate Python reference service that demonstrates the resulting project direction.

## Commands

- Install: `npm install`
- Develop: `npm run dev`
- Verify everything: `npm run check`
- Verify the Python service: `cd agent-platform && .venv/bin/ruff check . && .venv/bin/pytest`

## Engineering rules

- Keep the frontend dependency-light. Keep service work isolated in `agent-platform/`.
- Preserve the human approval rule: do not publish, merge protected branches, or deploy to production from the app without explicit user confirmation.
- Add or update tests for changes to job analysis or Codex-prompt generation.
- Before completing a change, run `npm run check`.

## Done when

The product input stays simple, generated recommendations map skills to concrete evidence, and the generated Codex prompt includes context, constraints, verification steps, and approval boundaries.
