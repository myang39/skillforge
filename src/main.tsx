import { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createProjectPlan } from './domain'
import './styles.css'

const sample = `Senior Frontend Engineer\nRequired: React, TypeScript, API design, automated testing, and CI/CD. Experience shipping production features on cloud infrastructure is a plus. Collaborate closely with product and design.`

function App() {
  const [jobPost, setJobPost] = useState(sample)
  const [jobPostUrl, setJobPostUrl] = useState('')
  const [goal, setGoal] = useState('Land a senior frontend role')
  const [started, setStarted] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')
  const plan = useMemo(() => createProjectPlan(jobPost, goal, jobPostUrl), [jobPost, goal, jobPostUrl])

  return <main>
    <header><p className="eyebrow">SKILLFORGE / MVP</p><h1>Turn a job post into proof of work.</h1><p className="lede">An approval-aware multi-agent studio that teaches while it ships.</p></header>
    <section className="input-grid">
      <label>Job post link<input type="url" placeholder="https://company.com/careers/frontend-engineer" value={jobPostUrl} onChange={(event) => setJobPostUrl(event.target.value)} /></label>
      <div className="url-actions"><p className="hint">Paste a public job link, then import its visible description. Some job boards may block automated imports.</p><button type="button" disabled={!jobPostUrl || importing} onClick={async () => {
        setImporting(true); setImportError('')
        try {
          const response = await fetch('/api/job-source', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: jobPostUrl }) })
          const result = await response.json() as { text?: string; sourceUrl?: string; error?: string }
          if (!response.ok || !result.text) throw new Error(result.error ?? 'Unable to import this job post.')
          setJobPost(result.text); setJobPostUrl(result.sourceUrl ?? jobPostUrl)
        } catch (error) { setImportError(error instanceof Error ? error.message : 'Unable to import this job post.') }
        finally { setImporting(false) }
      }}>{importing ? 'Importing…' : 'Import description'}</button></div>
      {importError && <p className="error" role="alert">{importError}</p>}
      <label>Job post description<textarea value={jobPost} onChange={(event) => setJobPost(event.target.value)} /></label>
      <label>Your target<input value={goal} onChange={(event) => setGoal(event.target.value)} /></label>
      <button onClick={() => setStarted(true)}>Generate project blueprint</button>
    </section>
    {started && <section className="results">
      <div className="hero-card"><p className="eyebrow">RECOMMENDED BUILD</p><h2>{plan.title}</h2><p>{plan.summary}</p>{plan.sourceUrl && <a className="source-link" href={plan.sourceUrl} target="_blank" rel="noreferrer">Open original job post ↗</a>}<div className="chips">{plan.requirements.map((item) => <span key={item.skill}>{item.skill}</span>)}</div></div>
      <div className="grid">
        <article><h3>Evidence matrix</h3>{plan.requirements.map((item) => <div className="requirement" key={item.skill}><b>{item.skill}</b><small>{item.priority === 'must' ? 'Required' : 'Plus'}</small><p>{item.evidence}</p></div>)}</article>
        <article><h3>Guided delivery</h3>{plan.milestones.map((item, index) => <div className="milestone" key={item.title}><span>{index + 1}</span><div><b>{item.title}</b><p>{item.owner}</p><small>{item.outcome}</small>{item.approval && <em>Needs your approval</em>}</div></div>)}</article>
      </div>
      <aside><b>Production rule</b><p>Agents may create local branches, tests, and preview artifacts. Publishing a repository, merging protected branches, or deploying to production always requires your explicit approval.</p></aside>
    </section>}
  </main>
}

createRoot(document.getElementById('root')!).render(<App />)
