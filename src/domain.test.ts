import { describe, expect, it } from 'vitest'
import { createProjectPlan, extractRequirements } from './domain'

describe('job analysis', () => {
  it('finds concrete skills and evidence', () => {
    const result = extractRequirements('Required: React, TypeScript, GitHub Actions, testing, and AWS.')
    expect(result.map((item) => item.skill)).toEqual(expect.arrayContaining(['React', 'TypeScript', 'CI/CD', 'Testing', 'Cloud deployment']))
    expect(result.every((item) => item.evidence.length > 0)).toBe(true)
  })

  it('creates an approval-aware workflow', () => {
    const plan = createProjectPlan('React and API design required.')
    expect(plan.milestones.filter((item) => item.approval)).toHaveLength(3)
    expect(plan.title).toContain('React')
  })
})
