import { useDB } from '~/server/utils/db'

interface CreateBody {
  name: string
  email?: string
  phone?: string
  company?: string
  notes?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CreateBody>(event)
  if (!body?.name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'الاسم مطلوب' })
  }

  const db = useDB(event)
  const now = Date.now()
  const result = await db
    .prepare(`
      INSERT INTO customers (name, email, phone, company, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      body.name.trim(),
      body.email?.trim() || null,
      body.phone?.trim() || null,
      body.company?.trim() || null,
      body.notes?.trim() || null,
      now,
      now,
    )
    .run()

  return { ok: true, id: result.meta?.last_row_id }
})
