import { useDB } from '~/server/utils/db'
import { getViewSession } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') ?? ''
  const body = await readBody<{ note?: string }>(event)
  const note = body?.note?.slice(0, 1000) || null

  const db = useDB(event)
  const proposal = await db
    .prepare('SELECT id, status, expires_at FROM proposals WHERE slug = ?')
    .bind(slug)
    .first<{ id: number; status: string; expires_at: number | null }>()
  if (!proposal) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  if (proposal.expires_at && proposal.expires_at < Date.now()) {
    throw createError({ statusCode: 410, statusMessage: 'Proposal expired' })
  }
  if (proposal.status === 'accepted' || proposal.status === 'declined') {
    throw createError({ statusCode: 409, statusMessage: 'Already decided' })
  }
  const hasView = await getViewSession(event, proposal.id)
  if (!hasView) throw createError({ statusCode: 401, statusMessage: 'Locked' })

  const now = Date.now()
  await db
    .prepare('UPDATE proposals SET status = ?, declined_at = ?, decline_note = ?, updated_at = ? WHERE id = ?')
    .bind('declined', now, note, now, proposal.id)
    .run()
  return { ok: true, status: 'declined', declined_at: now }
})
