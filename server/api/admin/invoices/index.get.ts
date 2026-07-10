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
  collected: number
  has_overdue: boolean
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export default defineEventHandler(async (event) => {
  const status = getQuery(event).status as string | undefined
  const db = useDB(event)
  const today = todayISO()

  const where = status && ['draft', 'sent', 'partially_paid', 'paid'].includes(status)
    ? 'WHERE i.status = ?'
    : ''

  const listStmt = db.prepare(`
    SELECT i.id, i.slug, i.number, i.status, i.issue_date, i.due_date,
           i.currency, i.adjustment, i.customer_id,
           c.name AS customer_name,
           COALESCE((SELECT SUM(amount) FROM invoice_items WHERE invoice_id = i.id), 0) AS subtotal,
           COALESCE((SELECT SUM(amount) FROM invoice_installments WHERE invoice_id = i.id AND status = 'paid'), 0) AS collected,
           EXISTS(
             SELECT 1 FROM invoice_installments
             WHERE invoice_id = i.id AND status = 'pending' AND due_date < ?
           ) AS has_overdue
    FROM invoices i
    JOIN customers c ON c.id = i.customer_id
    ${where}
    ORDER BY i.created_at DESC
  `)
  const boundList = where ? listStmt.bind(today, status) : listStmt.bind(today)
  const { results } = await boundList.all<ListRow>()
  const invoices = results.map(r => ({ ...r, has_overdue: !!r.has_overdue }))

  const statsStmt = db.prepare(`
    SELECT i.status,
           EXISTS(
             SELECT 1 FROM invoice_installments
             WHERE invoice_id = i.id AND status = 'pending' AND due_date < ?
           ) AS has_overdue,
           COALESCE((SELECT SUM(amount) FROM invoice_items WHERE invoice_id = i.id), 0) + i.adjustment AS total,
           COALESCE((SELECT SUM(amount) FROM invoice_installments WHERE invoice_id = i.id AND status = 'paid'), 0) AS collected
    FROM invoices i
  `)
  const { results: statRows } = await statsStmt.bind(today).all<{
    status: string; has_overdue: number; total: number; collected: number
  }>()

  const counts = { draft: 0, sent: 0, partially_paid: 0, paid: 0, overdue: 0 }
  let invoiced = 0
  let collected = 0
  for (const row of statRows) {
    if (row.status in counts) counts[row.status as keyof typeof counts]++
    if (row.status !== 'draft') {
      invoiced += row.total
      collected += row.collected
      if (row.status !== 'paid' && row.has_overdue) counts.overdue++
    }
  }

  return {
    invoices,
    stats: {
      counts,
      totals: { invoiced, collected, outstanding: invoiced - collected },
    },
  }
})
