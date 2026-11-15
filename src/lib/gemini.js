import { auth } from './firebase'

/**
 * Flatten the grouped stack object into a single string array.
 * Also handles the legacy flat-array format for backwards compat.
 */
export function flattenStack(stack) {
  if (!stack) return []
  if (Array.isArray(stack)) return stack
  return [
    ...(stack.languages || []),
    ...(stack.frameworks || []),
    ...(stack.databases || []),
    ...(stack.cloud || []),
  ].filter(Boolean)
}

/**
 * Generate a roadmap via the server-side /api/generate endpoint.
 * The Gemini API key lives only on the server (GEMINI_API_KEY) and is
 * never exposed to the browser.
 */
export async function generateRoadmap(payload) {
  const headers = { 'Content-Type': 'application/json' }
  try {
    const token = await auth?.currentUser?.getIdToken?.()
    if (token) headers.Authorization = `Bearer ${token}`
  } catch {
    // anonymous generation is allowed unless REQUIRE_AUTH=true server-side
  }

  const response = await fetch('/api/generate', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error || `Generation failed (${response.status})`)
  }
  return data
}
