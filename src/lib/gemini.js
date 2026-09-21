const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const MODEL = 'gemini-2.5-flash'

const SCHEMA = {
  type: 'object',
  properties: {
    project_title: { type: 'string' },
    description: { type: 'string' },
    why_it_fits: { type: 'string' },
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

/**
 * Flatten the grouped stack object into a single string array.
 * Also handles the legacy flat-array format for backwards compat.
 */
export function flattenStack(stack) {
  if (Array.isArray(stack)) return stack
  return [
    ...(stack.languages || []),
    ...(stack.frameworks || []),
    ...(stack.databases || []),
    ...(stack.cloud || []),
  ].filter(Boolean)
}

export async function generateRoadmap({
  skillLevel,
  strongestArea,
  stack,
  goal,
  timeFrame,
  domainInterest,
  constraints,
  priorProjects,
}) {
  const allTech = flattenStack(stack)

  // Build constraint instructions
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
      ? `\nPreferred domain: ${domainInterest}`
      : ''

  const priorBlock = priorProjects
    ? `\nProjects the student has already built (avoid suggesting something too similar):\n${priorProjects}`
    : ''

  const prompt = `You are a technical mentor for CS students. Based on the student's profile below, generate ONE specific, well-scoped project idea and a milestone breakdown.

Skill level: ${skillLevel}
Strongest area: ${strongestArea || 'General'}
Known tech stack: ${allTech.join(', ') || 'None specified'}
Career goal: ${goal}
Time available: ${timeFrame}${domainLine}${constraintBlock}${priorBlock}

Requirements:
- The project must be realistically achievable within the given time frame.
- Leverage the student's strongest area (${strongestArea || 'General'}) while stretching them slightly into complementary skills.
- Prefer projects with genuine engineering depth over another CRUD app, when the time frame allows for it.
- Milestones must be ordered, concrete, and each independently demoable.
- "estimated_time" should be a short range like "Day 1 - 3".
- Return ONLY the structured data — no extra commentary.`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
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

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Gemini API error (${response.status}): ${errText}`)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini returned no content — check your API key and quota.')

  return JSON.parse(text)
}
