import { useDB } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') ?? '', 10)
  if (!Number.isFinite(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  const db = useDB(event)
  await db.prepare('DELETE FROM proposal_views WHERE proposal_id = ?').bind(id).run()
  await db.prepare('DELETE FROM proposals WHERE id = ?').bind(id).run()
  return { ok: true }
})
