export type Requirement = { skill: string; evidence: string; priority: 'must' | 'plus' }

export type ProjectPlan = {
  title: string
  summary: string
  requirements: Requirement[]
  milestones: { title: string; owner: string; outcome: string; approval: boolean }[]
}

const skillPatterns: Array<[RegExp, string]> = [
  [/react|next\.js/i, 'React'],
  [/typescript/i, 'TypeScript'],
  [/node\.js|nodejs|express/i, 'Node.js'],
  [/python|fastapi|django/i, 'Python'],
  [/sql|postgres|database/i, 'SQL'],
  [/aws|gcp|azure|cloud/i, 'Cloud deployment'],
  [/docker|kubernetes|k8s/i, 'Containers'],
  [/ci\/cd|github actions|jenkins/i, 'CI/CD'],
  [/test|jest|vitest|playwright|cypress/i, 'Testing'],
  [/figma|ux|ui design|product design/i, 'Product design'],
  [/api|rest|graphql/i, 'API design'],
]

export function extractRequirements(jobPost: string): Requirement[] {
  const found = skillPatterns
    .filter(([pattern]) => pattern.test(jobPost))
    .map(([, skill]) => ({
      skill,
      evidence: evidenceFor(skill),
      priority: (new RegExp(`required|must|required qualifications|${skill}`, 'i').test(jobPost) ? 'must' : 'plus') as Requirement['priority'],
    }))

  return found.length ? uniqueBySkill(found) : [
    { skill: 'Product delivery', evidence: 'A deployed project with documented decisions', priority: 'must' },
    { skill: 'Testing', evidence: 'Automated tests run in CI', priority: 'must' },
  ]
}

export function createProjectPlan(jobPost: string): ProjectPlan {
  const requirements = extractRequirements(jobPost)
  const primary = requirements.find((item) => item.priority === 'must')?.skill ?? requirements[0].skill
  return {
    title: `${primary} Launchpad`,
    summary: `A production-shaped project that proves ${requirements.map((item) => item.skill).join(', ')} through reviewable code, tests, CI, and deployment evidence.`,
    requirements,
    milestones: [
      { title: 'Define the proof of work', owner: 'Product & career coach', outcome: 'PRD, success metrics, and job-skill evidence matrix', approval: true },
      { title: 'Design the system', owner: 'Designer & architect', outcome: 'User flow, API contract, data model, and ADR', approval: true },
      { title: 'Build in small PRs', owner: 'Implementation agent + candidate', outcome: 'Working vertical slices with intentional learning checkpoints', approval: false },
      { title: 'Review and harden', owner: 'Reviewer, QA & security agents', outcome: 'Review notes, tests, accessibility, and risk checklist', approval: false },
      { title: 'Ship with evidence', owner: 'DevOps & career coach', outcome: 'CI, preview deployment, README, demo script, and portfolio evidence', approval: true },
    ],
  }
}

export function createCodexPrompt(jobPost: string, plan: ProjectPlan) {
  const skills = plan.requirements.map((item) => `- ${item.skill}: ${item.evidence}`).join('\n')
  return `You are the lead engineer for a portfolio project derived from this job post. Work in the current repository and create a production-shaped implementation that the candidate can explain in an interview.

## Job post
${jobPost}

## Goal
Build: ${plan.title}
${plan.summary}

## Skills that need evidence
${skills}

## Required workflow
1. Inspect the repository and propose a concise implementation plan before editing.
2. Create the product/design artifacts needed to make the project coherent: a short PRD, user flow, architecture notes, and an evidence matrix.
3. Implement the smallest complete vertical slice first. Keep the code typed, accessible, and easy to review.
4. Add or update tests. Run lint, tests, and the production build; fix failures.
5. Review the final diff for correctness, security, and missing job-skill evidence.
6. Update the README with setup, verification steps, and a short interview/demo narrative.

## Boundaries
- Do not publish a repository, merge protected branches, or deploy to production without asking first.
- Prefer a local preview or draft deployment plan over external actions.
- When a product decision is material, present the options and ask for approval.

## Done when
- The project runs locally.
- Relevant checks pass.
- Every required skill above has a concrete artifact or documented gap.
- The README explains what was built, how to verify it, and how it maps to the job post.`
}

function evidenceFor(skill: string) {
  const map: Record<string, string> = {
    React: 'Responsive UI components and interaction tests', TypeScript: 'Strict types and typed API boundaries', 'Node.js': 'Service layer and validated API endpoints', Python: 'Backend service with tests', SQL: 'Schema, migrations, and data access tests', 'Cloud deployment': 'Preview URL and deployment runbook', Containers: 'Reproducible container build', 'CI/CD': 'GitHub Actions pipeline', Testing: 'Unit and integration test suite', 'Product design': 'User flow and documented design decisions', 'API design': 'OpenAPI contract and error model',
  }
  return map[skill] ?? 'A documented implementation and review artifact'
}

function uniqueBySkill(items: Requirement[]) {
  return Array.from(new Map(items.map((item) => [item.skill, item])).values())
}
