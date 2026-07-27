import express from 'express'
import { importJobDescription } from './job-source.js'

const app = express()
const port = Number(process.env.PORT ?? 8787)

app.use(express.json({ limit: '32kb' }))
app.post('/api/job-source', async (request, response) => {
  try {
    const result = await importJobDescription(request.body?.url)
    response.json(result)
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : 'Unable to import this job post.' })
  }
})

app.listen(port, () => console.log(`SkillForge API listening on http://127.0.0.1:${port}`))
