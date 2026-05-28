import { useDB } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'معرف القالب غير صحيح' })
  }

  const db = useDB(event)
  const template = await db
    .prepare('SELECT id FROM wa_templates WHERE id = ?')
    .bind(id)
    .first()

  if (!template) {
    throw createError({ statusCode: 404, statusMessage: 'القالب غير موجود' })
  }

  await db
    .prepare('DELETE FROM wa_templates WHERE id = ?')
    .bind(id)
    .run()

  return { ok: true }
})
