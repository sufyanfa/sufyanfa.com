import { useDB } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') ?? ''
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Missing slug' })

  const db = useDB(event)
  const proposal = await db
    .prepare('SELECT id, title, client_name, client_label, proposal_date, status, expires_at FROM proposals WHERE slug = ?')
    .bind(slug)
    .first<{
      id: number; title: string; client_name: string; client_label: string | null;
      proposal_date: string; status: string; expires_at: number | null
    }>()

  // Don't reveal draft state to public — treat as not-found
  if (!proposal || proposal.status === 'draft') {
    throw createError({ statusCode: 404, statusMessage: 'Proposal not found' })
  }

  const expired = !!(proposal.expires_at && proposal.expires_at < Date.now())

  return {
    title: proposal.title,
    client_name: proposal.client_name,
    client_label: proposal.client_label,
    proposal_date: proposal.proposal_date,
    expired,
    decided: proposal.status === 'accepted' || proposal.status === 'declined',
    status: proposal.status
  }
})
