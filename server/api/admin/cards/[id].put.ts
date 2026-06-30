import { useDB } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const body = await readBody<any>(event)
  if (!body) throw createError({ statusCode: 400, statusMessage: 'Body required' })

  const db = useDB(event)
  const card = await db.prepare('SELECT id FROM project_cards WHERE id = ?').bind(id).first()
  if (!card) throw createError({ statusCode: 404, statusMessage: 'البطاقة غير موجودة' })

  const updates: string[] = []
  const values: any[] = []

  if (body.title !== undefined) { updates.push('title = ?'); values.push(body.title.trim()) }
  if (body.list_key !== undefined) { updates.push('list_key = ?'); values.push(body.list_key) }
  if (body.position !== undefined) { updates.push('position = ?'); values.push(body.position) }
  if (body.person_name !== undefined) { updates.push('person_name = ?'); values.push(body.person_name) }
  updates.push('updated_at = ?'); values.push(Date.now())
  values.push(id)

  if (updates.length <= 1) return { ok: true }

  await db
    .prepare(`UPDATE project_cards SET ${updates.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run()

  return { ok: true }
})
