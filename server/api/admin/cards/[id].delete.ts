import { useDB } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const db = useDB(event)
  const result = await db.prepare('DELETE FROM project_cards WHERE id = ?').bind(id).run()
  if (!result.meta?.changes) throw createError({ statusCode: 404, statusMessage: 'البطاقة غير موجودة' })

  return { ok: true }
})
