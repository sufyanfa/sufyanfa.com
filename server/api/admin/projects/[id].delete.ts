import { useDB } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const db = useDB(event)
  const result = await db.prepare('DELETE FROM projects WHERE id = ?').bind(id).run()
  if (!result.meta?.changes) throw createError({ statusCode: 404, statusMessage: 'المشروع غير موجود' })

  return { ok: true }
})
