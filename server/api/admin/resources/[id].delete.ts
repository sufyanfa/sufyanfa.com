import { useDB } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  const db = useDB(event)
  await db.prepare('DELETE FROM project_resources WHERE id = ?').bind(id).run()
  return { ok: true }
})
