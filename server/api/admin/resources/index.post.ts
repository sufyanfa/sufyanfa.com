import { useDB } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ project_id: number; name: string; url: string; description?: string }>(event)
  if (!body || !body.project_id || !body.name?.trim() || !body.url?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'المشروع والاسم والرابط مطلوب' })
  }
  const db = useDB(event)
  const result = await db
    .prepare('INSERT INTO project_resources (project_id, name, url, description, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind(body.project_id, body.name.trim(), body.url.trim(), body.description?.trim() || null, Date.now())
    .run()
  if (!result.meta?.last_row_id) {
    throw createError({ statusCode: 500, statusMessage: 'فشل إضافة المورد' })
  }
  return { ok: true, id: result.meta.last_row_id }
})
