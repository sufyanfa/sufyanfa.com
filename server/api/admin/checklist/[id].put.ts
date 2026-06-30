import { useDB } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const body = await readBody<any>(event)
  if (!body) throw createError({ statusCode: 400, statusMessage: 'Body required' })

  const db = useDB(event)
  const item = await db.prepare('SELECT id FROM card_checklist_items WHERE id = ?').bind(id).first()
  if (!item) throw createError({ statusCode: 404, statusMessage: 'المهمة غير موجودة' })

  const updates: string[] = []
  const values: any[] = []

  if (body.title !== undefined) { updates.push('title = ?'); values.push(body.title.trim()) }
  if (body.assigned_to !== undefined) { updates.push('assigned_to = ?'); values.push(body.assigned_to) }
  if (body.is_complete !== undefined) { updates.push('is_complete = ?'); values.push(body.is_complete ? 1 : 0) }
  if (body.position !== undefined) { updates.push('position = ?'); values.push(body.position) }
  updates.push('updated_at = ?'); values.push(Date.now())
  values.push(id)

  if (updates.length <= 1) return { ok: true }

  await db
    .prepare(`UPDATE card_checklist_items SET ${updates.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run()

  return { ok: true }
})
