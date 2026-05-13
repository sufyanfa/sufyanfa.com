import { useDB } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const db = useDB(event)
  const { results } = await db
    .prepare(`
      SELECT p.id, p.slug, p.title, p.client_name, p.proposal_date, p.status,
             p.expires_at, p.accepted_at, p.declined_at, p.created_at, p.updated_at,
             (SELECT COUNT(*) FROM proposal_views v WHERE v.proposal_id = p.id) AS views_count,
             (SELECT MAX(viewed_at) FROM proposal_views v WHERE v.proposal_id = p.id) AS last_viewed_at
      FROM proposals p
      ORDER BY p.created_at DESC
    `)
    .all()
  return { proposals: results }
})
