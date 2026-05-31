import { useDB } from '~/server/utils/db'

interface CustomerRow {
  id: number
  name: string
  email: string | null
  phone: string | null
  company: string | null
  notes: string | null
  invoice_count: number
  last_invoice_at: number | null
}

export default defineEventHandler(async (event) => {
  const db = useDB(event)
  const { results } = await db
    .prepare(`
      SELECT c.id, c.name, c.email, c.phone, c.company, c.notes,
             COUNT(i.id) AS invoice_count,
             MAX(i.created_at) AS last_invoice_at
      FROM customers c
      LEFT JOIN invoices i ON i.customer_id = c.id
      GROUP BY c.id
      ORDER BY c.name ASC
    `)
    .all<CustomerRow>()
  return { customers: results }
})
