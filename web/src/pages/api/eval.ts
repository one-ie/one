import type { APIRoute } from 'astro'
import { getEnv } from '../../lib/cf-env'
import { runCase, type TestCase } from '../../lib/eval/runner'
import { gradeCase } from '../../lib/eval/grader'
import { aggregate } from '../../lib/eval/aggregate'
import { buildIterationPrompt } from '../../lib/eval/iterate'

export const prerender = false

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const POST: APIRoute = async ({ request }) => {
  const env = (await getEnv()) as unknown as {
    GROQ_API_KEY?: string
    CONTENT?: R2Bucket
  }

  if (!env.GROQ_API_KEY) return json({ error: 'GROQ_API_KEY not configured' }, 503)
  if (!env.CONTENT) return json({ error: 'CONTENT bucket not configured' }, 503)

  let body: { slug?: string; skillPath?: string; iteration?: number }
  try {
    body = await request.json()
  } catch {
    return json({ error: 'invalid json' }, 400)
  }

  const { slug, skillPath, iteration = 1 } = body
  if (!slug || !skillPath) return json({ error: 'slug and skillPath required' }, 400)

  const [skillObj, evalsObj] = await Promise.all([
    env.CONTENT.get(`${slug}/skills/${skillPath}.md`),
    env.CONTENT.get(`${slug}/skills/${skillPath}/evals/evals.json`),
  ])

  if (!skillObj) return json({ error: `skill not found: ${skillPath}` }, 404)
  if (!evalsObj) return json({ error: `evals.json not found for skill: ${skillPath}` }, 404)

  const [skillMd, evalsJson] = await Promise.all([skillObj.text(), evalsObj.text()])
  let testCases: TestCase[]
  try {
    testCases = JSON.parse(evalsJson)
  } catch {
    return json({ error: 'invalid evals.json' }, 422)
  }

  if (!testCases.length) return json({ error: 'no test cases' }, 422)

  const groqApiKey = env.GROQ_API_KEY
  const skillName = skillPath.split('/').at(-1) ?? skillPath

  const pairs = await Promise.all(
    testCases.map(async tc => {
      const [withRun, withoutRun] = await Promise.all([
        runCase(tc, skillMd, groqApiKey),
        runCase(tc, null, groqApiKey),
      ])
      const [withGrade, withoutGrade] = await Promise.all([
        gradeCase(tc, withRun, groqApiKey),
        gradeCase(tc, withoutRun, groqApiKey),
      ])
      return { tc, withRun, withGrade, withoutRun, withoutGrade }
    }),
  )

  const benchmark = aggregate(
    skillName,
    iteration,
    pairs.map(p => ({ run: p.withRun, grade: p.withGrade })),
    pairs.map(p => ({ run: p.withoutRun, grade: p.withoutGrade })),
  )

  await env.CONTENT.put(
    `${slug}/skills/_workspace/${skillName}/iteration-${iteration}/benchmark.json`,
    JSON.stringify(benchmark, null, 2),
  )

  const failures = pairs
    .filter(p => p.withGrade.passed < p.withGrade.total)
    .map(p => ({ testCase: p.tc, run: p.withRun, grade: p.withGrade }))

  return json({
    benchmark,
    iterationPrompt: failures.length ? buildIterationPrompt(skillMd, failures) : null,
  })
}
