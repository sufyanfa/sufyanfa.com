import { useDB } from '~/server/utils/db'
import { hashPassword } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const body = await readBody<any>(event)
  if (!body) throw createError({ statusCode: 400, statusMessage: 'Body required' })

  const db = useDB(event)
  const project = await db.prepare('SELECT id FROM projects WHERE id = ?').bind(id).first()
  if (!project) throw createError({ statusCode: 404, statusMessage: 'المشروع غير موجود' })

  const updates: string[] = []
  const values: any[] = []

  if (body.name !== undefined) { updates.push('name = ?'); values.push(body.name.trim()) }
  if (body.customer_id !== undefined) { updates.push('customer_id = ?'); values.push(body.customer_id) }
  if (body.status !== undefined) { updates.push('status = ?'); values.push(body.status) }
  if (body.start_date !== undefined) { updates.push('start_date = ?'); values.push(body.start_date || null) }
  if (body.end_date !== undefined) { updates.push('end_date = ?'); values.push(body.end_date || null) }
  if (body.notes !== undefined) { updates.push('notes = ?'); values.push(body.notes || null) }
  if (body.password) {
    const password_hash = await hashPassword(body.password)
    updates.push('password_hash = ?'); values.push(password_hash)
  }
  updates.push('updated_at = ?'); values.push(Date.now())
  values.push(id)

  if (updates.length <= 1) return { ok: true }

  await db
    .prepare(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run()

  return { ok: true }
})
