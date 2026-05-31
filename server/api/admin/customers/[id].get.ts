import { useDB } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const db = useDB(event)
  const customer = await db
    .prepare('SELECT * FROM customers WHERE id = ?')
    .bind(id)
    .first()
  if (!customer) throw createError({ statusCode: 404, statusMessage: 'العميل غير موجود' })

  const { results: invoices } = await db
    .prepare(`
      SELECT id, number, status, issue_date, due_date, slug
      FROM invoices WHERE customer_id = ?
      ORDER BY created_at DESC
    `)
    .bind(id)
    .all()

  return { customer, invoices }
})
