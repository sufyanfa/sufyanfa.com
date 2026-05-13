import { useDB } from '~/server/utils/db'
import {
  verifyPassword,
  setAdminSession,
  checkRateLimit,
  recordRateLimitFailure,
  hashIP,
} from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string; password?: string }>(event)
  const email = (body?.email || '').trim().toLowerCase()
  const password = body?.password || ''
  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Missing email or password' })
  }

  const db = useDB(event)
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const ipKey = await hashIP(ip)

  const allowed = await checkRateLimit(db, 'login', ipKey, 5, 600)
  if (!allowed) {
    throw createError({ statusCode: 429, statusMessage: 'Too many attempts. Try again later.' })
  }

  const user = await db
    .prepare('SELECT id, email, password_hash, is_admin FROM users WHERE email = ?')
    .bind(email)
    .first<{ id: number; email: string; password_hash: string; is_admin: number }>()

  if (!user || !user.is_admin) {
    await recordRateLimitFailure(db, 'login', ipKey)
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  const ok = await verifyPassword(password, user.password_hash)
  if (!ok) {
    await recordRateLimitFailure(db, 'login', ipKey)
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  await setAdminSession(event, { uid: user.id, is_admin: true })
  return { ok: true, email: user.email }
})
