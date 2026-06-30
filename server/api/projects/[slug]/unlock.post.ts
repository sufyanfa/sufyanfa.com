import { useDB } from '~/server/utils/db'
import { verifyPassword, signJWT, checkRateLimit, recordRateLimitFailure, hashIP } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') ?? ''
  const body = await readBody<{ password?: string }>(event)
  const password = body?.password || ''
  if (!slug || !password) throw createError({ statusCode: 400, statusMessage: 'Missing fields' })

  const db = useDB(event)
  const project = await db
    .prepare('SELECT id, password_hash, status FROM projects WHERE slug = ?')
    .bind(slug)
    .first<{ id: number; password_hash: string; status: string }>()

  if (!project || project.status !== 'active' || !project.password_hash) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const ipKey = `${slug}:${await hashIP(ip)}`
  const allowed = await checkRateLimit(db, 'project_unlock', ipKey, 8, 600)
  if (!allowed) {
    throw createError({ statusCode: 429, statusMessage: 'Too many attempts. Try again later.' })
  }

  const ok = await verifyPassword(password, project.password_hash)
  if (!ok) {
    await recordRateLimitFailure(db, 'project_unlock', ipKey)
    throw createError({ statusCode: 401, statusMessage: 'Invalid password' })
  }

  const secret = useRuntimeConfig().sessionSecret as string
  const token = await signJWT({ pid: project.id }, secret, 60 * 60 * 24)
  setCookie(event, `__pj_${project.id}`, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  })

  return { ok: true }
})
