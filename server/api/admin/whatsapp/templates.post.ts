import { useDB } from '~/server/utils/db'

interface CreateTemplateBody {
  name: string
  type: string
  body: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CreateTemplateBody>(event)
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
  const now = Date.now()
  const result = await db
    .prepare('INSERT INTO wa_templates (name, type, body, created_at, updated_at) VALUES (?, ?, ?, ?, ?)')
    .bind(
      body.name.trim(),
      body.type,
      body.body.trim(),
      now,
      now
    )
    .run()

  return { ok: true, id: result.meta?.last_row_id }
})
