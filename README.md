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

## Product direction

The next slice is a GitHub App integration that turns approved milestones into issues and branches, then has dedicated product, design, builder, reviewer, QA, and DevOps agents generate reviewable artifacts.

## Use with Codex

Paste a job description, generate the blueprint, then use **Copy Codex prompt**. Open a new Codex task in the folder where you want the portfolio project built and paste the prompt. The prompt asks Codex to plan, build, test, review, and document the project without publishing or deploying externally unless you approve it.
