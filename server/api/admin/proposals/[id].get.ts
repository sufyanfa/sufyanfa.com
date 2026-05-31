import { useDB } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') ?? '', 10)
  if (!Number.isFinite(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const db = useDB(event)
  const proposal = await db
    .prepare(`
      SELECT id, slug, title, client_name, client_label, proposal_date, content_md,
             cta_label, cta_url, status, expires_at, accepted_at, declined_at, decline_note,
             price, price_after_discount, created_at, updated_at
      FROM proposals WHERE id = ?
    `)
    .bind(id)
    .first()
  if (!proposal) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  const { results: views } = await db
    .prepare('SELECT viewed_at, user_agent FROM proposal_views WHERE proposal_id = ? ORDER BY viewed_at DESC LIMIT 50')
    .bind(id)
    .all()

  const stats = await db
    .prepare('SELECT COUNT(*) as count, MAX(viewed_at) as last FROM proposal_views WHERE proposal_id = ?')
    .bind(id)
    .first<{ count: number; last: number | null }>()

  return {
    proposal,
    views,
    stats: { count: stats?.count ?? 0, last_viewed_at: stats?.last ?? null }
  }
})
