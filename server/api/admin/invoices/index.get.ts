import { useDB } from '~/server/utils/db'

interface ListRow {
  id: number
  slug: string
  number: string
  status: string
  issue_date: string
  due_date: string
  currency: string
  adjustment: number
  customer_name: string
  customer_id: number
  subtotal: number
}

export default defineEventHandler(async (event) => {
  const status = getQuery(event).status as string | undefined
  const db = useDB(event)

  const where = status && ['draft', 'sent', 'paid'].includes(status)
    ? 'WHERE i.status = ?'
    : ''

  const stmt = db.prepare(`
    SELECT i.id, i.slug, i.number, i.status, i.issue_date, i.due_date,
           i.currency, i.adjustment, i.customer_id,
           c.name AS customer_name,
           COALESCE((SELECT SUM(amount) FROM invoice_items WHERE invoice_id = i.id), 0) AS subtotal
    FROM invoices i
    JOIN customers c ON c.id = i.customer_id
    ${where}
    ORDER BY i.created_at DESC
  `)
  const bound = where ? stmt.bind(status) : stmt
  const { results } = await bound.all<ListRow>()

  return { invoices: results }
})
