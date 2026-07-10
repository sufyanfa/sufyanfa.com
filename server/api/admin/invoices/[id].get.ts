import { useDB } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const db = useDB(event)
  const invoice = await db
    .prepare('SELECT * FROM invoices WHERE id = ?')
    .bind(id)
    .first()
  if (!invoice) throw createError({ statusCode: 404, statusMessage: 'الفاتورة غير موجودة' })

  const customer = await db
    .prepare('SELECT * FROM customers WHERE id = ?')
    .bind((invoice as any).customer_id)
    .first()

  const { results: items } = await db
    .prepare('SELECT id, position, description, amount FROM invoice_items WHERE invoice_id = ? ORDER BY position ASC')
    .bind(id)
    .all()

  const { results: installments } = await db
    .prepare('SELECT id, position, label, percentage, amount, due_date, status, paid_at FROM invoice_installments WHERE invoice_id = ? ORDER BY position ASC')
    .bind(id)
    .all()

  return { invoice, customer, items, installments }
})
