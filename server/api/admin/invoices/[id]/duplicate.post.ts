import { useDB } from '~/server/utils/db'
import { randomSlug } from '~/server/utils/slug'

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}
function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const db = useDB(event)
  const src = await db.prepare('SELECT * FROM invoices WHERE id = ?').bind(id).first<any>()
  if (!src) throw createError({ statusCode: 404, statusMessage: 'الفاتورة غير موجودة' })

  const settings = await db
    .prepare('SELECT default_due_days FROM settings WHERE id = 1')
    .first<{ default_due_days: number }>()
  const dueDays = settings?.default_due_days ?? 14

  const issue = todayISO()
  const due = addDaysISO(issue, dueDays)
  const now = Date.now()

  let newId: number | undefined
  let lastErr: unknown
  for (let attempt = 0; attempt < 3; attempt++) {
    const slug = randomSlug()
    try {
      const result = await db
        .prepare(`
          INSERT INTO invoices
            (slug, number, customer_id, status, issue_date, due_date, currency,
             adjustment, adjustment_label, notes, created_at, updated_at)
          VALUES (
            ?,
            'INV-' || strftime('%Y','now') || '-' ||
              printf('%04d',
                COALESCE(
                  (SELECT MAX(CAST(substr(number, 10) AS INTEGER))
                     FROM invoices
                    WHERE number LIKE 'INV-' || strftime('%Y','now') || '-%'),
                  0) + 1),
            ?, 'draft', ?, ?, ?, ?, ?, ?, ?, ?
          )
        `)
        .bind(
          slug,
          src.customer_id,
          issue,
          due,
          src.currency || 'SAR',
          src.adjustment,
          src.adjustment_label,
          src.notes,
          now,
          now,
        )
        .run()
      newId = result.meta?.last_row_id
      if (!newId) throw new Error('No last_row_id')
      break
    } catch (e: any) {
      lastErr = e
      if (!/UNIQUE/i.test(String(e?.message ?? e))) throw e
    }
  }
  if (!newId) throw createError({ statusCode: 500, statusMessage: `Failed to duplicate: ${String(lastErr)}` })

  // Clone items.
  const { results: items } = await db
    .prepare('SELECT position, description, amount FROM invoice_items WHERE invoice_id = ? ORDER BY position ASC')
    .bind(id)
    .all<{ position: number; description: string; amount: number }>()
  for (const it of items) {
    await db
      .prepare('INSERT INTO invoice_items (invoice_id, position, description, amount) VALUES (?, ?, ?, ?)')
      .bind(newId, it.position, it.description, it.amount)
      .run()
  }

  return { ok: true, id: newId }
})
