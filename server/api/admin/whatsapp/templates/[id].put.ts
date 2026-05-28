import { useDB } from '~/server/utils/db'

interface UpdateTemplateBody {
  name: string
  type: string
  body: string
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'معرف القالب غير صحيح' })
  }

  const body = await readBody<UpdateTemplateBody>(event)
  if (!body?.name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'اسم القالب مطلوب' })
  }
  if (!body?.type?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'نوع القالب مطلوب' })
  }
  if (!body?.body?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'نص القالب مطلوب' })
  }

  const allowedTypes = ['invoice_overdue', 'invoice_reminder', 'offer_new', 'offer_expired', 'custom']
  if (!allowedTypes.includes(body.type)) {
    throw createError({ statusCode: 400, statusMessage: 'نوع القالب غير مدعوم' })
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
    .prepare('UPDATE wa_templates SET name = ?, type = ?, body = ?, updated_at = ? WHERE id = ?')
    .bind(
      body.name.trim(),
      body.type,
      body.body.trim(),
      Date.now(),
      id
    )
    .run()

  return { ok: true }
})
