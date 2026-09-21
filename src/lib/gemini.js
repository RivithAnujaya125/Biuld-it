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

export async function generateRoadmap({ skillLevel, stack, goal, timeFrame }) {
  const prompt = `You are a technical mentor for CS students. Based on the student's profile below, generate ONE specific, well-scoped project idea and a milestone breakdown.

Skill level: ${skillLevel}
Known tech stack: ${stack.join(', ')}
Career goal: ${goal}
Time available: ${timeFrame}

Requirements:
- The project must be realistically achievable within the given time frame.
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
    }
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
