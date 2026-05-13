import { useDB } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') ?? '', 10)
  if (!Number.isFinite(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const db = useDB(event)
  const proposal = await db.prepare('SELECT id, status FROM proposals WHERE id = ?').bind(id).first<{ id: number; status: string }>()
  if (!proposal) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  if (proposal.status === 'draft') {
    await db
      .prepare('UPDATE proposals SET status = ?, updated_at = ? WHERE id = ?')
      .bind('sent', Date.now(), id)
      .run()
  }
  return { ok: true, status: 'sent' }
})
