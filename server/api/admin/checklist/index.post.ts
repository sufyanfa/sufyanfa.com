import { useDB } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ card_id: number; title: string; assigned_to?: string }>(event)
  if (!body || !body.card_id || !body.title?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'البطاقة والعنوان مطلوبان' })
  }

  const db = useDB(event)
  const now = Date.now()

  const { results: existing } = await db
    .prepare('SELECT COALESCE(MAX(position), -1) + 1 AS next_pos FROM card_checklist_items WHERE card_id = ?')
    .bind(body.card_id)
    .all() as any

  const position = existing?.[0]?.next_pos ?? 0

  const result = await db
    .prepare('INSERT INTO card_checklist_items (card_id, title, assigned_to, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(body.card_id, body.title.trim(), body.assigned_to || '', position, now, now)
    .run()

  if (!result.meta?.last_row_id) {
    throw createError({ statusCode: 500, statusMessage: 'فشل إنشاء المهمة' })
  }

  return { ok: true, id: result.meta.last_row_id }
})
