import { useDB } from '~/server/utils/db'
import { getViewSession } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') ?? ''
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Missing slug' })

  const db = useDB(event)
  const proposal = await db
    .prepare(`
      SELECT id, slug, title, client_name, client_label, proposal_date, content_md,
             cta_label, cta_url, status, expires_at, accepted_at, declined_at, decline_note
      FROM proposals WHERE slug = ?
    `)
    .bind(slug)
    .first<any>()

  if (!proposal || proposal.status === 'draft') {
    throw createError({ statusCode: 404, statusMessage: 'Proposal not found' })
  }
  if (proposal.expires_at && proposal.expires_at < Date.now()) {
    throw createError({ statusCode: 410, statusMessage: 'Proposal expired' })
  }

  const hasView = await getViewSession(event, proposal.id)
  if (!hasView) throw createError({ statusCode: 401, statusMessage: 'Locked' })

  // strip server-only fields
  delete proposal.id
  return proposal
})
