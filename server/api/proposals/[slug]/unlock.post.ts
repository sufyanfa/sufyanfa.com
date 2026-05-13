import { useDB } from '~/server/utils/db'
import {
  verifyPassword,
  setViewSession,
  checkRateLimit,
  recordRateLimitFailure,
  hashIP
} from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') ?? ''
  const body = await readBody<{ password?: string }>(event)
  const password = body?.password || ''
  if (!slug || !password) throw createError({ statusCode: 400, statusMessage: 'Missing fields' })

  const db = useDB(event)
  const proposal = await db
    .prepare('SELECT id, status, password_hash, expires_at FROM proposals WHERE slug = ?')
    .bind(slug)
    .first<{ id: number; status: string; password_hash: string; expires_at: number | null }>()

  if (!proposal || proposal.status === 'draft') {
    throw createError({ statusCode: 404, statusMessage: 'Proposal not found' })
  }
  if (proposal.expires_at && proposal.expires_at < Date.now()) {
    throw createError({ statusCode: 410, statusMessage: 'Proposal expired' })
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const ipKey = `${slug}:${await hashIP(ip)}`
  const allowed = await checkRateLimit(db, 'unlock', ipKey, 8, 600)
  if (!allowed) {
    throw createError({ statusCode: 429, statusMessage: 'Too many attempts. Try again later.' })
  }

  const ok = await verifyPassword(password, proposal.password_hash)
  if (!ok) {
    await recordRateLimitFailure(db, 'unlock', ipKey)
    throw createError({ statusCode: 401, statusMessage: 'Invalid password' })
  }

  await setViewSession(event, proposal.id, slug)

  // Log view
  const ua = getRequestHeader(event, 'user-agent') || null
  await db
    .prepare('INSERT INTO proposal_views (proposal_id, viewed_at, ip_hash, user_agent) VALUES (?, ?, ?, ?)')
    .bind(proposal.id, Date.now(), await hashIP(ip), ua)
    .run()

  // sent → viewed
  if (proposal.status === 'sent') {
    await db
      .prepare('UPDATE proposals SET status = ?, updated_at = ? WHERE id = ?')
      .bind('viewed', Date.now(), proposal.id)
      .run()
  }

  return { ok: true }
})
