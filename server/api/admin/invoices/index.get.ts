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
  const query = getQuery(event)
  const status = query.status as string | undefined
  const dateField = query.dateField === 'due_date' ? 'due_date' : 'issue_date'
  const monthRaw = query.month as string | undefined
  const month = monthRaw && /^\d{4}-\d{2}$/.test(monthRaw) ? monthRaw : undefined

  const db = useDB(event)
  const today = todayISO()

  const listConditions: string[] = []
  const listParams: unknown[] = [today]
  if (status && ['draft', 'sent', 'partially_paid', 'paid'].includes(status)) {
    listConditions.push('i.status = ?')
    listParams.push(status)
  }
  if (month) {
    listConditions.push(`strftime('%Y-%m', i.${dateField}) = ?`)
    listParams.push(month)
  }
  const listWhere = listConditions.length ? `WHERE ${listConditions.join(' AND ')}` : ''

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
    ${listWhere}
    ORDER BY i.created_at DESC
  `)
  const { results } = await listStmt.bind(...listParams).all<ListRow>()
  const invoices = results.map(r => ({ ...r, has_overdue: !!r.has_overdue }))

  // Stats scope to the month filter (a monthly report when a month is picked)
  // but never to the status filter, since they break down counts BY status.
  const statsWhere = month ? `WHERE strftime('%Y-%m', i.${dateField}) = ?` : ''
  const statsParams = month ? [today, month] : [today]

  const statsStmt = db.prepare(`
    SELECT i.status,
           EXISTS(
             SELECT 1 FROM invoice_installments
             WHERE invoice_id = i.id AND status = 'pending' AND due_date < ?
           ) AS has_overdue,
           COALESCE((SELECT SUM(amount) FROM invoice_items WHERE invoice_id = i.id), 0) + i.adjustment AS total,
           COALESCE((SELECT SUM(amount) FROM invoice_installments WHERE invoice_id = i.id AND status = 'paid'), 0) AS collected
    FROM invoices i
    ${statsWhere}
  `)
  const { results: statRows } = await statsStmt.bind(...statsParams).all<{
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
