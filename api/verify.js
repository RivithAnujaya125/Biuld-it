import fs from 'fs'
import path from 'path'

/**
 * Serverless function: /api/verify
 * 
 * Verifies a student's actual GitHub repository against their generated roadmap milestones.
 * Uses Gemini 3.8 Flash with thinkingLevel: "HIGH" for deep code reasoning across the codebase.
 * 
 * NOTE ON GITHUB REST API RATE LIMITS:
 * Unauthenticated requests to GitHub's REST API are rate-limited to 60 requests/hour per IP address.
 * An optional GITHUB_TOKEN or VITE_GITHUB_TOKEN can be provided in environment variables to raise
 * the rate limit to 5,000 requests/hour for higher-volume verification.
 */

// Common source code file extensions to include in analysis
const SOURCE_EXTENSIONS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
  '.py', '.java', '.go', '.rs', '.c', '.cpp', '.h', '.hpp',
  '.cs', '.rb', '.php', '.swift', '.kt', '.kts',
  '.html', '.css', '.scss', '.sass', '.vue', '.svelte',
  '.sql', '.prisma', '.json', '.yaml', '.yml', '.toml',
  '.md', '.sh'
])

// Directories to skip during tree traversal to preserve context window and avoid noise
const IGNORED_DIRS = [
  'node_modules/', 'dist/', 'build/', '.git/', '.next/', '.nuxt/',
  '.output/', 'out/', 'vendor/', 'target/', 'bin/', 'obj/',
  'coverage/', '.vscode/', '.idea/', '__pycache__/', '.cache/',
  'venv/', '.env/', 'env/'
]

// Package lock files and build artifacts to skip
const IGNORED_FILES = new Set([
  'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb',
  'Cargo.lock', 'Gemfile.lock', 'poetry.lock'
])

// Token & size budget:
// Gemini 3.8 Flash has a 1M token context window.
// Cap combined file content at ~1.2MB (~300K tokens) to leave generous room for the prompt,
// reasoning trace (thinkingLevel HIGH), and structured response.
const MAX_TOTAL_CHARS = 1_200_000 // ~300K tokens
const MAX_SINGLE_FILE_CHARS = 60_000

// Helper to resolve Gemini API key from process.env or local .env
function getGeminiApiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY
  if (process.env.VITE_GEMINI_API_KEY) return process.env.VITE_GEMINI_API_KEY
  try {
    const envPath = path.resolve(process.cwd(), '.env')
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8')
      const m = content.match(/(?:VITE_)?GEMINI_API_KEY\s*=\s*(.+)/)
      if (m) return m[1].trim()
    }
  } catch (err) {
    console.warn('Could not read .env file:', err.message)
  }
  return null
}

// Parse GitHub URL to extract owner and repository name
export function parseGitHubUrl(url) {
  if (!url || typeof url !== 'string') return null
  const clean = url.trim().replace(/\.git$/, '').replace(/\/$/, '')
  const match = clean.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([^/\s]+)\/([^/\s]+)/i) ||
                clean.match(/^([^/\s]+)\/([^/\s]+)$/)
  if (match) {
    return { owner: match[1], repo: match[2] }
  }
  return null
}

export default async function handler(req, res) {
  // Polyfill response helpers for standard Node / Vite middleware environments
  if (!res.status) {
    res.status = (code) => {
      res.statusCode = code
      return res
    }
  }
  if (!res.json) {
    res.json = (data) => {
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(data))
      return res
    }
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' })
  }

  // Parse request body if not already parsed
  let body = req.body
  if (!body) {
    try {
      const raw = await new Promise((resolve, reject) => {
        let acc = ''
        req.on('data', (c) => { acc += c })
        req.on('end', () => resolve(acc))
        req.on('error', reject)
      })
      body = raw ? JSON.parse(raw) : {}
    } catch (e) {
      return res.status(400).json({ error: 'Malformed JSON body.' })
    }
  } else if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch (e) {
      return res.status(400).json({ error: 'Malformed JSON body.' })
    }
  }

  const { repoUrl, milestones, techStack, tech_stack } = body
  const finalTechStack = techStack || tech_stack || []

  if (!repoUrl) {
    return res.status(400).json({ error: 'GitHub repository URL is required.' })
  }

  if (!milestones || !Array.isArray(milestones) || milestones.length === 0) {
    return res.status(400).json({ error: 'A list of milestones is required for verification.' })
  }

  const parsed = parseGitHubUrl(repoUrl)
  if (!parsed) {
    return res.status(400).json({
      error: 'Invalid GitHub repository URL format. Please provide https://github.com/owner/repo or owner/repo.'
    })
  }

  const { owner, repo } = parsed
  const apiKey = getGeminiApiKey()
  if (!apiKey) {
    return res.status(500).json({
      error: 'Gemini API key is not configured. Set GEMINI_API_KEY in .env.'
    })
  }

  // Configure GitHub API headers (unauthenticated is limited to 60 req/hr)
  const ghHeaders = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'build-it-verifier',
  }
  const githubToken = process.env.GITHUB_TOKEN || process.env.VITE_GITHUB_TOKEN
  if (githubToken) {
    ghHeaders['Authorization'] = `token ${githubToken}`
  }

  // Step 1: Fetch repository metadata
  let repoData
  try {
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers: ghHeaders })
    if (repoRes.status === 404) {
      return res.status(404).json({ error: 'Repo not found or private — make it public to verify' })
    }
    if (repoRes.status === 403) {
      const remaining = repoRes.headers.get('x-ratelimit-remaining')
      return res.status(403).json({
        error: `GitHub API rate limit exceeded (60 req/hr for unauthenticated requests). ${
          remaining !== null ? `Remaining: ${remaining}. ` : ''
        }Please try again later.`
      })
    }
    if (!repoRes.ok) {
      const errJson = await repoRes.json().catch(() => ({}))
      return res.status(repoRes.status).json({
        error: `GitHub API error (${repoRes.status}): ${errJson.message || repoRes.statusText}`
      })
    }
    repoData = await repoRes.json()
  } catch (err) {
    return res.status(502).json({ error: `Failed to connect to GitHub: ${err.message}` })
  }

  const defaultBranch = repoData.default_branch || 'main'

  // Step 2: Fetch Git tree recursively
  let tree = []
  try {
    const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`, {
      headers: ghHeaders
    })
    if (treeRes.status === 404 || treeRes.status === 409) {
      // Empty repo with no commits
      const emptyStatuses = milestones.map((m, idx) => ({
        milestone_index: idx,
        status: 'Not Started',
        evidence: [],
        notes: 'Repository is empty (no commits or tree found).'
      }))
      return res.status(200).json({
        repo: `${owner}/${repo}`,
        branch: defaultBranch,
        milestone_statuses: emptyStatuses,
        summary: 'The repository is currently empty. No source files have been committed yet.',
        verifiedWith: 'gemini-3.8-flash'
      })
    }
    if (treeRes.status === 403) {
      return res.status(403).json({
        error: 'GitHub API rate limit exceeded (60 req/hr for unauthenticated requests). Please try again later.'
      })
    }
    if (!treeRes.ok) {
      const errJson = await treeRes.json().catch(() => ({}))
      return res.status(treeRes.status).json({
        error: `Failed to fetch repo file tree (${treeRes.status}): ${errJson.message || treeRes.statusText}`
      })
    }
    const treeJson = await treeRes.json()
    tree = treeJson.tree || []
  } catch (err) {
    return res.status(502).json({ error: `Failed to fetch file tree from GitHub: ${err.message}` })
  }

  // Step 3: Filter relevant source code files
  const relevantFiles = []
  const skippedDirs = new Set()

  for (const item of tree) {
    if (item.type !== 'blob') continue
    const filePath = item.path

    // Check ignored directories
    const ignoredDir = IGNORED_DIRS.find(dir => filePath.startsWith(dir) || filePath.includes('/' + dir))
    if (ignoredDir) {
      skippedDirs.add(ignoredDir.replace(/\/$/, ''))
      continue
    }

    const filename = filePath.split('/').pop()
    if (IGNORED_FILES.has(filename)) continue

    const ext = '.' + filename.split('.').pop().toLowerCase()
    if (SOURCE_EXTENSIONS.has(ext)) {
      relevantFiles.push(item)
    }
  }

  // Step 4: Fetch raw content of relevant files up to budget
  let totalChars = 0
  const fileContents = []
  const warnings = []

  for (const file of relevantFiles) {
    if (totalChars >= MAX_TOTAL_CHARS) {
      warnings.push(
        `Context budget reached (~300K tokens). Truncated remaining files starting at "${file.path}".`
      )
      break
    }
    try {
      // Use raw.githubusercontent.com which does not consume REST API rate limits
      const rawRes = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${file.path}`
      )
      if (rawRes.ok) {
        let text = await rawRes.text()
        if (text.length > MAX_SINGLE_FILE_CHARS) {
          text = text.slice(0, MAX_SINGLE_FILE_CHARS) + '\n\n// [Truncated: File exceeded 60KB limit]'
        }
        totalChars += text.length
        fileContents.push({ path: file.path, content: text })
      }
    } catch (err) {
      console.warn(`Could not fetch raw file content for ${file.path}:`, err.message)
    }
  }

  const fileTreeSummary = tree.map(t => `${t.type === 'tree' ? '📁' : '📄'} ${t.path}`).join('\n')
  const fileContentBlocks = fileContents.length > 0
    ? fileContents.map(f => `=== FILE: ${f.path} ===\n${f.content}\n`).join('\n')
    : '(No readable source files found in repository)'

  // Step 5: Construct prompt for Gemini 3.8 Flash
  const prompt = `You are a senior software engineering mentor rigorously evaluating a student's actual GitHub repository against their roadmap milestones.

PROJECT DECLARED TECH STACK:
${Array.isArray(finalTechStack) ? finalTechStack.join(', ') : finalTechStack || 'None specified'}

ROADMAP MILESTONES TO VERIFY:
${milestones.map((m, idx) => `Milestone ${idx} (Index: ${idx}):
- Title: ${m.title}
- Description: ${m.description}
- Estimated Timeframe: ${m.estimated_time || 'N/A'}`).join('\n\n')}

REPOSITORY OVERVIEW:
- Repository: ${owner}/${repo}
- Default Branch: ${defaultBranch}
- Total Items in Tree: ${tree.length}
- Relevant Source Files Analyzed: ${fileContents.length}

COMPLETE REPOSITORY FILE TREE:
${fileTreeSummary}

SOURCE CODE IMPLEMENTATION:
${fileContentBlocks}

EVALUATION INSTRUCTIONS:
For each milestone (from index 0 to ${milestones.length - 1}):
1. Determine the status based strictly on concrete evidence in the repository code:
   - "Complete": Substantial, working implementation matching the milestone description is clearly present in the code.
   - "In Progress": Partial implementation exists (e.g. scaffolding, some components/functions, or unfinished logic), but requirements are only partially met.
   - "Not Started": No meaningful code exists for this milestone.
2. In "evidence", list the specific file path(s) (e.g. "src/App.jsx", "package.json") that support your conclusion. If Not Started, return an empty array [].
3. In "notes", provide a clear technical assessment:
   - Cite what code was actually built.
   - Note if any implementation looks buggy, incomplete, or diverges from the declared tech stack.
   - If Not Started, briefly indicate what files/logic would be expected.
4. In "summary", give an encouraging, high-level synthesis of repository progress against the roadmap.

Be precise, objective, and constructive. Return valid JSON matching the schema.`

  const responseSchema = {
    type: 'object',
    properties: {
      milestone_statuses: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            milestone_index: {
              type: 'integer',
              description: '0-based index of the milestone'
            },
            status: {
              type: 'string',
              enum: ['Not Started', 'In Progress', 'Complete'],
              description: 'Verification status of the milestone'
            },
            evidence: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of relevant file paths from the repository that support this status'
            },
            notes: {
              type: 'string',
              description: 'Technical evaluation of completeness, potential bugs, or missing requirements'
            }
          },
          required: ['milestone_index', 'status', 'evidence', 'notes']
        }
      },
      summary: {
        type: 'string',
        description: 'High-level synthesis of repository progress against the roadmap'
      }
    },
    required: ['milestone_statuses']
  }

  // Model strategy:
  // Use Gemini 3.8 Flash with thinkingLevel: "HIGH" specifically for this complex code reasoning task.
  // In the event of temporary upstream 503 high-demand spikes, retry, and gracefully fall back
  // to Gemini 2.5 Flash to ensure verification reliability.
  const models = [
    { name: 'gemini-3.8-flash', thinking: { thinkingLevel: 'HIGH' } },
    { name: 'gemini-2.5-flash', thinking: {} }
  ]

  let lastError = null
  let verificationOutput = null
  let activeModelUsed = 'gemini-3.8-flash'

  for (const modelConfig of models) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelConfig.name}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: responseSchema,
                ...(Object.keys(modelConfig.thinking).length > 0 ? { thinkingConfig: modelConfig.thinking } : {})
              }
            })
          }
        )

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json()
          const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
          if (text) {
            verificationOutput = JSON.parse(text)
            activeModelUsed = modelConfig.name
            break
          }
        } else {
          const errData = await geminiRes.json().catch(() => ({}))
          lastError = new Error(errData.error?.message || `Gemini API error ${geminiRes.status}`)
          if (geminiRes.status !== 503) {
            // Non-503 error, break attempt loop
            break
          }
          await new Promise(r => setTimeout(r, 1500 * attempt))
        }
      } catch (err) {
        lastError = err
      }
    }
    if (verificationOutput) break
  }

  if (!verificationOutput) {
    return res.status(500).json({
      error: `Gemini verification failed: ${lastError?.message || 'No response from model'}`
    })
  }

  // Ensure all milestones have a corresponding entry
  const statusMap = new Map()
  if (Array.isArray(verificationOutput.milestone_statuses)) {
    for (const item of verificationOutput.milestone_statuses) {
      statusMap.set(item.milestone_index, item)
    }
  }

  const finalStatuses = milestones.map((m, idx) => {
    const existing = statusMap.get(idx)
    if (existing) {
      return {
        milestone_index: idx,
        status: existing.status || 'Not Started',
        evidence: Array.isArray(existing.evidence) ? existing.evidence : [],
        notes: existing.notes || 'No specific notes provided.'
      }
    }
    return {
      milestone_index: idx,
      status: 'Not Started',
      evidence: [],
      notes: 'No matching code evidence found.'
    }
  })

  return res.status(200).json({
    repo: `${owner}/${repo}`,
    branch: defaultBranch,
    milestone_statuses: finalStatuses,
    summary: verificationOutput.summary || 'Roadmap progress verified.',
    warnings: warnings.length > 0 ? warnings : undefined,
    skippedDirectories: skippedDirs.size > 0 ? Array.from(skippedDirs) : undefined,
    verifiedWith: activeModelUsed,
    verifiedAt: new Date().toISOString()
  })
}
