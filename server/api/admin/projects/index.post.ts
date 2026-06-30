import { useDB } from '~/server/utils/db'
import { uniqueSlug, nameSlug } from '~/server/utils/slug'
import { hashPassword } from '~/server/utils/auth'

interface ProjectInput {
  name: string
  customer_id: number
  slug?: string
  password?: string
  start_date?: string
  end_date?: string
  notes?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ProjectInput>(event)
  if (!body || !body.name?.trim() || !Number.isFinite(body.customer_id)) {
    throw createError({ statusCode: 400, statusMessage: 'الاسم والعميل مطلوبان' })
  }
  const db = useDB(event)
  const slug = body.slug?.trim()
    ? nameSlug(body.slug)
    : await uniqueSlug(body.name, db)
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'رابط المشروع غير صالح' })
  const password_hash = body.password ? await hashPassword(body.password) : ''
  const now = Date.now()

  const result = await db
    .prepare(`
      INSERT INTO projects (slug, name, customer_id, password_hash, start_date, end_date, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(slug, body.name.trim(), body.customer_id, password_hash, body.start_date || null, body.end_date || null, body.notes || null, now, now)
    .run()

  if (!result.meta?.last_row_id) {
    throw createError({ statusCode: 500, statusMessage: 'فشل إنشاء المشروع' })
  }

  return { ok: true, id: result.meta.last_row_id, slug }
})
