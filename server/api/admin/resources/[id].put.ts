import { useDB } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const body = await readBody<{ name?: string; url?: string; description?: string }>(event)
  if (!body) throw createError({ statusCode: 400, statusMessage: 'Body required' })

  const db = useDB(event)
  const resource = await db.prepare('SELECT id FROM project_resources WHERE id = ?').bind(id).first()
  if (!resource) throw createError({ statusCode: 404, statusMessage: 'المورد غير موجود' })

  const updates: string[] = []
  const values: any[] = []
  if (body.name !== undefined) { updates.push('name = ?'); values.push(body.name.trim()) }
  if (body.url !== undefined) { updates.push('url = ?'); values.push(body.url.trim()) }
  if (body.description !== undefined) { updates.push('description = ?'); values.push(body.description?.trim() || null) }
  if (!updates.length) return { ok: true }
  values.push(id)
  await db.prepare(`UPDATE project_resources SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run()
  return { ok: true }
})
