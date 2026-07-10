import { useDB } from '~/server/utils/db'
import { getAdminSession } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Invalid slug' })

  const preview = String(getQuery(event).preview ?? '') === '1'

  const db = useDB(event)
  const invoice = await db
    .prepare('SELECT * FROM invoices WHERE slug = ?')
    .bind(slug)
    .first<any>()
  if (!invoice) throw createError({ statusCode: 404, statusMessage: 'الفاتورة غير موجودة' })

  if (invoice.status === 'draft') {
    if (!preview) throw createError({ statusCode: 404, statusMessage: 'الفاتورة غير موجودة' })
    const session = await getAdminSession(event)
    if (!session) throw createError({ statusCode: 404, statusMessage: 'الفاتورة غير موجودة' })
  }

  const customer = await db
    .prepare('SELECT id, name, email, phone, company FROM customers WHERE id = ?')
    .bind(invoice.customer_id)
    .first()

  const { results: items } = await db
    .prepare('SELECT id, position, description, amount FROM invoice_items WHERE invoice_id = ? ORDER BY position ASC')
    .bind(invoice.id)
    .all()

  const { results: installments } = await db
    .prepare('SELECT id, position, label, percentage, amount, due_date, status, paid_at FROM invoice_installments WHERE invoice_id = ? ORDER BY position ASC')
    .bind(invoice.id)
    .all()

  const settings = await db
    .prepare(`
      SELECT business_name, logo_url, email, phone, address,
             bank_name, bank_account_name, bank_account_number, bank_iban
      FROM settings WHERE id = 1
    `)
    .first()

  // Don't expose customer.notes or settings.default_notes/default_due_days.
  return { invoice, customer, items, installments, settings }
})
