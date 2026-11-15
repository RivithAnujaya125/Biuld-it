import {
  setCors,
  polyfillRes,
  parseJsonBody,
  getGeminiApiKey,
  checkRateLimit,
  authenticate,
} from './_shared.js'

const MODEL = 'gemini-2.5-flash'

const SCHEMA = {
  type: 'object',
  properties: {
    project_title: { type: 'string' },
    description: { type: 'string' },
    why_it_fits: { type: 'string' },
    resume_bullet: {
      type: 'string',
      description: 'One-line resume-ready summary. Only meaningful when project purpose is Resume Bullet.',
    },
    tech_stack: { type: 'array', items: { type: 'string' } },
    milestones: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          estimated_time: { type: 'string' },
        },
        required: ['title', 'description', 'estimated_time'],
      },
    },
  },
  required: ['project_title', 'description', 'why_it_fits', 'tech_stack', 'milestones'],
}

function flattenStack(stack) {
  if (!stack) return []
  if (Array.isArray(stack)) return stack.filter(Boolean).map(String)
  return [
    ...(stack.languages || []),
    ...(stack.frameworks || []),
    ...(stack.databases || []),
    ...(stack.cloud || []),
  ].filter(Boolean).map(String)
}

function clampStr(v, max = 2000) {
  if (typeof v !== 'string') return ''
  return v.slice(0, max)
}

export default async function handler(req, res) {
  polyfillRes(res)
  setCors(req, res)

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' })
  }

  // Rate limit: generation is cheap-ish but still LLM-backed.
  const rl = checkRateLimit(req, { limit: 20, windowMs: 60_000 })
  res.setHeader('X-RateLimit-Remaining', String(rl.remaining))
  if (!rl.allowed) {
    return res.status(429).json({ error: 'Too many requests. Please wait a minute and retry.' })
  }

  // Optional auth: attach uid if a valid token is supplied, stay open otherwise.
  // Set REQUIRE_AUTH=true to force sign-in for generation.
  await authenticate(req, res, { mode: 'optional' })
  if (res.writableEnded || res.finished) return

  let body
  try {
    body = await parseJsonBody(req)
  } catch {
    return res.status(400).json({ error: 'Malformed JSON body.' })
  }

  const {
    skillLevel = 'Intermediate',
    strongestArea = 'General',
    growthFocus = '',
    stack = [],
    goal = '',
    projectPurpose = '',
    timeFrame = '2 Weeks',
    weeklyHours = '',
    domainInterest = 'No Preference',
    constraints = {},
    priorProjects = '',
  } = body || {}

  if (!goal && !priorProjects) {
    // goal is the main signal; require at least something meaningful
    return res.status(400).json({ error: 'Career goal is required.' })
  }

  const allTech = flattenStack(stack)
  const constraintLines = []
  if (constraints?.openSource) {
    constraintLines.push(
      '- The project MUST be suitable for open-source publication (no proprietary APIs or closed-source dependencies required).',
    )
  }
  if (constraints?.noCrud) {
    constraintLines.push(
      '- Do NOT suggest a basic CRUD app. The project must have genuine engineering depth — think real-time features, data pipelines, CLI tools, browser extensions, algorithms, etc.',
    )
  }
  const constraintBlock = constraintLines.length
    ? `\nHard constraints:\n${constraintLines.join('\n')}`
    : ''

  const domainLine =
    domainInterest && domainInterest !== 'No Preference'
      ? `\nPreferred domain: ${clampStr(domainInterest, 100)}`
      : ''

  const priorBlock = priorProjects
    ? `\nProjects the student has already built (avoid suggesting something too similar):\n${clampStr(priorProjects, 2000)}`
    : ''

  const growthLine = growthFocus
    ? `\nGrowth focus (stretch area, NOT current strength): ${clampStr(String(growthFocus), 100)}`
    : ''

  const weeklyLine = weeklyHours
    ? `\nWeekly availability: ${clampStr(String(weeklyHours), 50)} — treat calendar duration × weekly hours as the TRUE total-effort budget for scoping (e.g. "2 Weeks" × "5-10 hrs" ≈ 10-20 total hours), not the calendar duration alone.`
    : ''

  const purposeLine = projectPurpose
    ? `\nProject purpose (defines what "done" means): ${clampStr(String(projectPurpose), 100)}`
    : ''

  const purposeInstructions = (() => {
    switch (projectPurpose) {
      case 'Resume Bullet':
        return '\n- Because the purpose is Resume Bullet, include a crisp one-line "resume_bullet" summary of the finished project, and make the final milestone produce something demoable enough to describe in that line.'
      case 'Live Demo to Share':
        return '\n- Because the purpose is Live Demo to Share, the FINAL milestone must be an explicit "deploy and share the link" milestone (deploy, verify the live URL works, polish first-load/empty states for a stranger clicking the link).'
      case 'Open Source Contribution':
        return '\n- Because the purpose is Open Source Contribution, the FINAL milestone must be "write a clear README + open starter issues" (setup instructions, contribution notes, and good-first-issues scoped from the build).'
      case 'Pure Learning':
        return '\n- Because the purpose is Pure Learning, skip any deployment/presentation milestone — focus every milestone purely on the build and the concepts learned.'
      default:
        return ''
    }
  })()

  const prompt = `You are a technical mentor for CS students. Based on the student's profile below, generate ONE specific, well-scoped project idea and a milestone breakdown.\n\nSkill level: ${clampStr(String(skillLevel), 50)}\nStrongest area: ${clampStr(String(strongestArea || 'General'), 50)}${growthLine}\nKnown tech stack: ${allTech.join(', ').slice(0, 500) || 'None specified'}\nCareer goal: ${clampStr(String(goal), 200)}\nTime available: ${clampStr(String(timeFrame), 50)}${weeklyLine}${purposeLine}${domainLine}${constraintBlock}${priorBlock}\n\nRequirements:\n- The project must be realistically achievable within the TRUE total-effort budget above — scope to hours, not just calendar weeks.\n- Leverage the student's strongest area (${clampStr(String(strongestArea || 'General'), 50)}) while stretching them slightly into complementary skills.\n- Include at least one "stretch milestone" that deliberately touches their growth focus (${clampStr(String(growthFocus || 'their stated growth area'), 100)}), even if it is outside their strongest area — frame it as a stretch, not the whole project.${purposeInstructions}\n- Prefer projects with genuine engineering depth over another CRUD app, when the time frame allows for it.\n- Milestones must be ordered, concrete, and each independently demoable.\n- "estimated_time" should be a short range like "Day 1 - 3".\n- Return ONLY the structured data — no extra commentary.`

  const apiKey = getGeminiApiKey()
  if (!apiKey) {
    return res.status(500).json({
      error: 'Gemini API key is not configured. Set GEMINI_API_KEY in server env.',
    })
  }

  // Retry once on 503 (transient overload), then surface error.
  let lastError = null
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: SCHEMA,
            },
          }),
        },
      )
      if (response.ok) {
        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (!text) {
          return res.status(502).json({ error: 'Gemini returned no content — check API quota.' })
        }
        return res.status(200).json(JSON.parse(text))
      }
      const errJson = await response.json().catch(() => ({}))
      lastError = new Error(errJson.error?.message || `Gemini API error ${response.status}`)
      if (response.status !== 503 || attempt === 2) {
        return res.status(502).json({ error: lastError.message })
      }
      await new Promise((r) => setTimeout(r, 1200 * attempt))
    } catch (err) {
      lastError = err
      if (attempt === 2) break
      await new Promise((r) => setTimeout(r, 1200 * attempt))
    }
  }
  return res.status(502).json({ error: `Gemini generation failed: ${lastError?.message || 'unknown error'}` })
}