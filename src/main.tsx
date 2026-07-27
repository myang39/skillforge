import { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createProjectPlan } from './domain'
import './styles.css'

const sample = `Senior Frontend Engineer\nRequired: React, TypeScript, API design, automated testing, and CI/CD. Experience shipping production features on cloud infrastructure is a plus. Collaborate closely with product and design.`

function App() {
  const [jobPost, setJobPost] = useState(sample)
  const [goal, setGoal] = useState('Land a senior frontend role')
  const [started, setStarted] = useState(false)
  const plan = useMemo(() => createProjectPlan(jobPost, goal), [jobPost, goal])

  return <main>
    <header><p className="eyebrow">SKILLFORGE / MVP</p><h1>Turn a job post into proof of work.</h1><p className="lede">An approval-aware multi-agent studio that teaches while it ships.</p></header>
    <section className="input-grid">
      <label>Job post<textarea value={jobPost} onChange={(event) => setJobPost(event.target.value)} /></label>
      <label>Your target<input value={goal} onChange={(event) => setGoal(event.target.value)} /></label>
      <button onClick={() => setStarted(true)}>Generate project blueprint</button>
    </section>
    {started && <section className="results">
      <div className="hero-card"><p className="eyebrow">RECOMMENDED BUILD</p><h2>{plan.title}</h2><p>{plan.summary}</p><div className="chips">{plan.requirements.map((item) => <span key={item.skill}>{item.skill}</span>)}</div></div>
      <div className="grid">
        <article><h3>Evidence matrix</h3>{plan.requirements.map((item) => <div className="requirement" key={item.skill}><b>{item.skill}</b><small>{item.priority === 'must' ? 'Required' : 'Plus'}</small><p>{item.evidence}</p></div>)}</article>
        <article><h3>Guided delivery</h3>{plan.milestones.map((item, index) => <div className="milestone" key={item.title}><span>{index + 1}</span><div><b>{item.title}</b><p>{item.owner}</p><small>{item.outcome}</small>{item.approval && <em>Needs your approval</em>}</div></div>)}</article>
      </div>
      <aside><b>Production rule</b><p>Agents may create local branches, tests, and preview artifacts. Publishing a repository, merging protected branches, or deploying to production always requires your explicit approval.</p></aside>
    </section>}
  </main>
}

createRoot(document.getElementById('root')!).render(<App />)
