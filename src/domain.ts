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

export function createProjectPlan(jobPost: string, candidateGoal: string): ProjectPlan {
  const requirements = extractRequirements(jobPost)
  const primary = requirements.find((item) => item.priority === 'must')?.skill ?? requirements[0].skill
  return {
    title: `${primary} Launchpad`,
    summary: `A production-shaped project that proves ${requirements.map((item) => item.skill).join(', ')} while helping the candidate pursue: ${candidateGoal || 'this role'}.`,
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

function evidenceFor(skill: string) {
  const map: Record<string, string> = {
    React: 'Responsive UI components and interaction tests', TypeScript: 'Strict types and typed API boundaries', 'Node.js': 'Service layer and validated API endpoints', Python: 'Backend service with tests', SQL: 'Schema, migrations, and data access tests', 'Cloud deployment': 'Preview URL and deployment runbook', Containers: 'Reproducible container build', 'CI/CD': 'GitHub Actions pipeline', Testing: 'Unit and integration test suite', 'Product design': 'User flow and documented design decisions', 'API design': 'OpenAPI contract and error model',
  }
  return map[skill] ?? 'A documented implementation and review artifact'
}

function uniqueBySkill(items: Requirement[]) {
  return Array.from(new Map(items.map((item) => [item.skill, item])).values())
}
