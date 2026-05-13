import type { H3Event } from 'h3'

const PBKDF2_ITERATIONS = 100_000
const PBKDF2_KEY_LENGTH = 32
const SALT_LENGTH = 16

const ADMIN_COOKIE = '__session'
const VIEW_COOKIE_PREFIX = '__pv_'
const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days
const VIEW_COOKIE_MAX_AGE = 60 * 60 * 24 // 24 hours

/* -------- base64url helpers -------- */

function bytesToB64Url(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64UrlToBytes(s: string): Uint8Array {
  const pad = '='.repeat((4 - (s.length % 4)) % 4)
  const b64 = (s + pad).replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

function utf8ToBytes(s: string): Uint8Array {
  return new TextEncoder().encode(s)
}

/* -------- password hashing (PBKDF2-SHA256) -------- */

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const key = await crypto.subtle.importKey(
    'raw',
    utf8ToBytes(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    key,
    PBKDF2_KEY_LENGTH * 8
  )
  return `pbkdf2$${PBKDF2_ITERATIONS}$${bytesToB64Url(salt)}$${bytesToB64Url(new Uint8Array(bits))}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$')
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false
  const iterations = parseInt(parts[1], 10)
  if (!Number.isFinite(iterations)) return false
  const salt = b64UrlToBytes(parts[2])
  const expected = b64UrlToBytes(parts[3])
  const key = await crypto.subtle.importKey(
    'raw',
    utf8ToBytes(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    key,
    expected.length * 8
  )
  const actual = new Uint8Array(bits)
  if (actual.length !== expected.length) return false
  let diff = 0
  for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i]
  return diff === 0
}

/* -------- JWT (HS256, minimal) -------- */

interface JWTPayload {
  [k: string]: unknown
  exp: number
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    utf8ToBytes(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

export async function signJWT(payload: Omit<JWTPayload, 'exp'> & { exp?: number }, secret: string, maxAgeSec: number): Promise<string> {
  const fullPayload: JWTPayload = { ...payload, exp: payload.exp ?? Math.floor(Date.now() / 1000) + maxAgeSec }
  const header = bytesToB64Url(utf8ToBytes(JSON.stringify({ alg: 'HS256', typ: 'JWT' })))
  const body = bytesToB64Url(utf8ToBytes(JSON.stringify(fullPayload)))
  const data = `${header}.${body}`
  const key = await hmacKey(secret)
  const sig = await crypto.subtle.sign('HMAC', key, utf8ToBytes(data))
  return `${data}.${bytesToB64Url(new Uint8Array(sig))}`
}

export async function verifyJWT<T extends JWTPayload = JWTPayload>(token: string, secret: string): Promise<T | null> {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [header, body, sig] = parts
  const key = await hmacKey(secret)
  const valid = await crypto.subtle.verify('HMAC', key, b64UrlToBytes(sig), utf8ToBytes(`${header}.${body}`))
  if (!valid) return null
  let payload: T
  try {
    payload = JSON.parse(new TextDecoder().decode(b64UrlToBytes(body)))
  } catch {
    return null
  }
  if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return null
  return payload
}

/* -------- cookie helpers -------- */

function getSecret(): string {
  const secret = useRuntimeConfig().sessionSecret as string
  if (!secret || secret === 'dev-only-change-me-in-production') {
    if (process.env.NODE_ENV === 'production') {
      throw createError({ statusCode: 500, statusMessage: 'SESSION_SECRET is not configured' })
    }
  }
  return secret
}

export async function setAdminSession(event: H3Event, payload: { uid: number; is_admin: boolean }): Promise<void> {
  const token = await signJWT(payload, getSecret(), ADMIN_COOKIE_MAX_AGE)
  setCookie(event, ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: ADMIN_COOKIE_MAX_AGE,
    path: '/'
  })
}

export function clearAdminSession(event: H3Event): void {
  deleteCookie(event, ADMIN_COOKIE, { path: '/' })
}

export async function getAdminSession(event: H3Event): Promise<{ uid: number; is_admin: boolean } | null> {
  const token = getCookie(event, ADMIN_COOKIE)
  if (!token) return null
  const payload = await verifyJWT<{ uid: number; is_admin: boolean; exp: number }>(token, getSecret())
  if (!payload || !payload.is_admin) return null
  return { uid: payload.uid, is_admin: payload.is_admin }
}

export async function setViewSession(event: H3Event, proposalId: number, _slug: string): Promise<void> {
  const token = await signJWT({ pid: proposalId }, getSecret(), VIEW_COOKIE_MAX_AGE)
  setCookie(event, `${VIEW_COOKIE_PREFIX}${proposalId}`, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: VIEW_COOKIE_MAX_AGE,
    path: '/'
  })
}

export async function getViewSession(event: H3Event, proposalId: number): Promise<boolean> {
  const token = getCookie(event, `${VIEW_COOKIE_PREFIX}${proposalId}`)
  if (!token) return false
  const payload = await verifyJWT<{ pid: number; exp: number }>(token, getSecret())
  return !!payload && payload.pid === proposalId
}

/* -------- ip hashing for view log -------- */

export async function hashIP(ip: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', utf8ToBytes(ip))
  return bytesToB64Url(new Uint8Array(buf)).slice(0, 16)
}

/* -------- rate limiting via D1 -------- */

export async function checkRateLimit(
  db: import('./db').D1Database,
  scope: string,
  key: string,
  maxAttempts: number,
  windowSec: number
): Promise<boolean> {
  const cutoff = Date.now() - windowSec * 1000
  const row = await db
    .prepare('SELECT COUNT(*) as n FROM login_attempts WHERE scope = ? AND key = ? AND attempted_at > ?')
    .bind(scope, key, cutoff)
    .first<{ n: number }>()
  return (row?.n ?? 0) < maxAttempts
}

export async function recordRateLimitFailure(
  db: import('./db').D1Database,
  scope: string,
  key: string
): Promise<void> {
  await db
    .prepare('INSERT INTO login_attempts (scope, key, attempted_at) VALUES (?, ?, ?)')
    .bind(scope, key, Date.now())
    .run()
}
