import { useDB } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ project_id: number; title: string; list_key?: string; person_name?: string }>(event)
  if (!body || !body.project_id || !body.title?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'المشروع والعنوان مطلوبان' })
  }

  const db = useDB(event)
  const now = Date.now()

  const { results: existing } = await db
    .prepare('SELECT COALESCE(MAX(position), -1) + 1 AS next_pos FROM project_cards WHERE project_id = ? AND list_key = ?')
    .bind(body.project_id, body.list_key || 'future')
    .all() as any

  const position = existing?.[0]?.next_pos ?? 0

  const result = await db
    .prepare('INSERT INTO project_cards (project_id, title, list_key, position, person_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(body.project_id, body.title.trim(), body.list_key || 'future', position, body.person_name || '', now, now)
    .run()

  if (!result.meta?.last_row_id) {
    throw createError({ statusCode: 500, statusMessage: 'فشل إنشاء البطاقة' })
  }

  return { ok: true, id: result.meta.last_row_id }
})
