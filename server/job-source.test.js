import { describe, expect, it } from 'vitest'
import { toPlainText } from './job-source.js'

describe('job source parsing', () => {
  it('removes non-content tags and normalizes readable text', () => {
    expect(toPlainText('<style>bad</style><h1>Senior Engineer</h1><script>bad</script><p>Build APIs &amp; UI</p>')).toBe('Senior Engineer Build APIs & UI')
  })
})
