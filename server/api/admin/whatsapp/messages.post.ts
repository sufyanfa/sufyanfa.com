import { useDB } from '~/server/utils/db'

interface CreateMessageBody {
  template_id?: number | null
  customer_id?: number | null
  phone: string
  body: string
  ref_type?: string | null
  ref_id?: number | null
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CreateMessageBody>(event)
  if (!body?.phone?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'رقم الهاتف مطلوب' })
  }
  if (!body?.body?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'محتوى الرسالة مطلوب' })
  }

  const db = useDB(event)
  const now = Date.now()

  const result = await db
    .prepare(`
      INSERT INTO wa_messages (
        template_id, customer_id, phone, body, ref_type, ref_id, status, sent_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'sent', ?)
    `)
    .bind(
      body.template_id || null,
      body.customer_id || null,
      body.phone.trim(),
      body.body.trim(),
      body.ref_type || null,
      body.ref_id || null,
      now
    )
    .run()

  return { ok: true, id: result.meta?.last_row_id }
})
