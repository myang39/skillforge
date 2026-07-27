# SkillForge

SkillForge turns a job post into a guided, evidence-backed portfolio project. It does not treat autonomous code output as evidence: each project maps job requirements to design, code, tests, CI, deployment artifacts, and user approvals.

## Current MVP

- Parse a job post into a skill/evidence matrix.
- Produce a scoped project blueprint and multi-agent delivery workflow.
- Preserve approval gates for repository publication, protected-branch merges, and production deployment.
- Run unit tests, linting, and production builds in GitHub Actions.

## Run locally

```bash
npm install
npm run dev
```

## Product direction

The next slice is a GitHub App integration that turns approved milestones into issues and branches, then has dedicated product, design, builder, reviewer, QA, and DevOps agents generate reviewable artifacts.
