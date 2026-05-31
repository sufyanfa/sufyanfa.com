import { useDB } from '~/server/utils/db'

interface UpdateBody {
  name: string
  email?: string
  phone?: string
  company?: string
  notes?: string
}

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const body = await readBody<UpdateBody>(event)
  if (!body?.name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'الاسم مطلوب' })
  }

  const db = useDB(event)
  const result = await db
    .prepare(`
      UPDATE customers
      SET name = ?, email = ?, phone = ?, company = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `)
    .bind(
      body.name.trim(),
      body.email?.trim() || null,
      body.phone?.trim() || null,
      body.company?.trim() || null,
      body.notes?.trim() || null,
      Date.now(),
      id,
    )
    .run()

  if (!result.meta?.changes) {
    throw createError({ statusCode: 404, statusMessage: 'العميل غير موجود' })
  }
  return { ok: true }
})
