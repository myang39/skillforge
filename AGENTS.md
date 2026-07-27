# SkillForge agent guidance

SkillForge converts a job description into a scoped, evidence-backed portfolio-project blueprint and a prompt that a user can hand to Codex.

## Commands

- Install: `npm install`
- Develop: `npm run dev`
- Verify everything: `npm run check`

## Engineering rules

- Keep the MVP client-side and dependency-light unless a user explicitly asks for a service integration.
- Preserve the human approval rule: do not publish, merge protected branches, or deploy to production from the app without explicit user confirmation.
- Add or update tests for changes to job analysis or Codex-prompt generation.
- Before completing a change, run `npm run check`.

## Done when

The product input stays simple, generated recommendations map skills to concrete evidence, and the generated Codex prompt includes context, constraints, verification steps, and approval boundaries.
