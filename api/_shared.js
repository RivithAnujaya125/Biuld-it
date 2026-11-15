import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

// ---- CORS ----
export function setCors(req, res) {
  const allowed = (process.env.ALLOWED_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean)
  // Same-origin by default; reflect whitelisted origin if provided, else '*'
  // for local dev convenience.
  const origin = req.headers?.origin
  if (allowed.length > 0 && origin && allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  } else if (allowed.length === 0) {
    res.setHeader('Access-Control-Allow-Origin', '*')
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export function polyfillRes(res) {
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
}

export async function parseJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string' && req.body.length > 0) {
    return JSON.parse(req.body)
  }
  const raw = await new Promise((resolve, reject) => {
    let acc = ''
    req.on('data', (c) => { acc += c })
    req.on('end', () => resolve(acc))
    req.on('error', reject)
  })
  if (!raw) return {}
  return JSON.parse(raw)
}

// ---- Gemini API key (server-only; never VITE_*) ----
export function getGeminiApiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY.trim()
  try {
    const envPath = path.resolve(process.cwd(), '.env')
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8')
      const m = content.match(/^GEMINI_API_KEY\s*=\s*(.+)$/m)
      if (m) return m[1].trim().replace(/^["']|["']$/g, '')
    }
  } catch (err) {
    console.warn('Could not read .env file:', err.message)
  }
  return null
}

// ---- Minimal in-memory rate limiter (per-IP, sliding window) ----
// NOTE: per-process only. For multi-instance production use Redis/Upstash.
const buckets = new Map()
export function checkRateLimit(req, { limit = 20, windowMs = 60_000 } = {}) {
  const ip = req.headers?.['x-forwarded-for']?.split(',')[0]?.trim()
    || req.socket?.remoteAddress || 'unknown'
  const now = Date.now()
  const key = `${ip}`
  let entry = buckets.get(key)
  if (!entry || now - entry.start > windowMs) {
    entry = { start: now, count: 0 }
  }
  entry.count += 1
  buckets.set(key, entry)
  // opportunistic cleanup
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (now - v.start > windowMs) buckets.delete(k)
    }
  }
  return {
    allowed: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    resetMs: entry.start + windowMs - now,
  }
}

// ---- Firebase ID token verification (no firebase-admin dependency) ----
// Verifies RS256 JWT signature against Google's public certs.
let certCache = { keys: null, expiresAt: 0 }
async function getGoogleCerts() {
  const now = Date.now()
  if (certCache.keys && now < certCache.expiresAt) return certCache.keys
  const res = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com')
  if (!res.ok) throw new Error('Failed to fetch Google certs')
  const keys = await res.json()
  const cc = res.headers.get('cache-control') || ''
  const m = cc.match(/max-age=(\d+)/)
  const ttl = m ? parseInt(m[1], 10) * 1000 : 60 * 60 * 1000
  certCache = { keys, expiresAt: now + Math.min(ttl, 6 * 60 * 60 * 1000) }
  return keys
}

function b64urlDecode(input) {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/')
  return Buffer.from(b64, 'base64').toString('utf8')
}

export async function verifyFirebaseIdToken(idToken) {
  if (!idToken) return { valid: false, error: 'Missing ID token' }
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID
  if (!projectId) return { valid: false, error: 'Server missing FIREBASE_PROJECT_ID' }
  const parts = idToken.split('.')
  if (parts.length !== 3) return { valid: false, error: 'Malformed token' }
  let header, payload
  try {
    header = JSON.parse(b64urlDecode(parts[0]))
    payload = JSON.parse(b64urlDecode(parts[1]))
  } catch {
    return { valid: false, error: 'Malformed token payload' }
  }
  if (header.alg !== 'RS256') return { valid: false, error: 'Unexpected token alg' }
  if (!header.kid) return { valid: false, error: 'Token missing kid' }
  // exp / iat / aud / iss checks
  const nowSec = Math.floor(Date.now() / 1000)
  if (payload.exp && payload.exp < nowSec - 30) return { valid: false, error: 'Token expired' }
  if (payload.iat && payload.iat > nowSec + 30) return { valid: false, error: 'Token issued in future' }
  if (payload.aud !== projectId) return { valid: false, error: 'Token audience mismatch' }
  const iss = payload.iss || ''
  if (iss !== `https://securetoken.google.com/${projectId}`) {
    return { valid: false, error: 'Token issuer mismatch' }
  }
  if (!payload.sub) return { valid: false, error: 'Token missing sub' }
  // signature check
  try {
    const certs = await getGoogleCerts()
    const cert = certs[header.kid]
    if (!cert) return { valid: false, error: 'Unknown signing key' }
    const verifier = crypto.createVerify('RSA-SHA256')
    verifier.update(`${parts[0]}.${parts[1]}`)
    const ok = verifier.verify(cert, parts[2], 'base64url')
    if (!ok) return { valid: false, error: 'Invalid token signature' }
  } catch (err) {
    return { valid: false, error: `Signature check failed: ${err.message}` }
  }
  return { valid: true, uid: payload.sub, payload }
}

export function getBearerToken(req) {
  const h = req.headers?.authorization || req.headers?.Authorization
  if (!h || typeof h !== 'string') return null
  const m = h.match(/^Bearer\s+(.+)$/i)
  return m ? m[1].trim() : null
}

// Auth mode: 'required' enforces token; 'optional' attaches user if present.
// Set REQUIRE_AUTH=true to enforce on verify endpoint.
export async function authenticate(req, res, { mode = 'optional' } = {}) {
  const enforced = process.env.REQUIRE_AUTH === 'true' || mode === 'required'
  const token = getBearerToken(req)
  if (!token) {
    if (enforced) {
      res.status(401).json({ error: 'Authentication required. Sign in and retry.' })
      return null
    }
    return { anonymous: true }
  }
  const result = await verifyFirebaseIdToken(token)
  if (!result.valid) {
    if (enforced) {
      res.status(401).json({ error: `Invalid auth token: ${result.error}` })
      return null
    }
    // optional mode: treat invalid token as anonymous but log
    console.warn('Ignoring invalid ID token:', result.error)
    return { anonymous: true }
  }
  return { uid: result.uid }
}