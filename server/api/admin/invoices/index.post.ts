import { useDB } from '~/server/utils/db'
import { randomSlug } from '~/server/utils/slug'

interface ItemInput {
  description: string
  amount: number
}

interface CreateBody {
  customer_id: number
  issue_date: string         // 'YYYY-MM-DD'
  due_date: string           // 'YYYY-MM-DD'
  items: ItemInput[]
  adjustment?: number
  adjustment_label?: string
  notes?: string
  status?: 'draft' | 'sent'  // defaults to 'draft'
}

function isISODate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s)
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CreateBody>(event)
  if (!body) throw createError({ statusCode: 400, statusMessage: 'Body required' })

  if (!Number.isFinite(body.customer_id)) {
    throw createError({ statusCode: 400, statusMessage: 'العميل مطلوب' })
  }
  if (!isISODate(body.issue_date) || !isISODate(body.due_date)) {
    throw createError({ statusCode: 400, statusMessage: 'التواريخ غير صحيحة' })
  }
  if (body.due_date < body.issue_date) {
    throw createError({ statusCode: 400, statusMessage: 'تاريخ الاستحقاق قبل تاريخ الإصدار' })
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'يجب إضافة بند واحد على الأقل' })
  }
  for (const it of body.items) {
    if (!it.description?.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'وصف البند مطلوب' })
    }
    if (!Number.isFinite(it.amount) || it.amount < 0) {
      throw createError({ statusCode: 400, statusMessage: 'مبلغ البند غير صحيح' })
    }
  }
  const status = body.status === 'sent' ? 'sent' : 'draft'
  const adjustment = Number.isFinite(body.adjustment) ? Math.trunc(body.adjustment as number) : 0
  const now = Date.now()

  const db = useDB(event)

  // Verify the customer exists.
  const cust = await db.prepare('SELECT id FROM customers WHERE id = ?').bind(body.customer_id).first()
  if (!cust) throw createError({ statusCode: 400, statusMessage: 'العميل غير موجود' })

  // Atomic insert with computed sequential number. Up to 2 retries on rare
  // slug/number race (D1 has no transactions across .run() calls).
  let lastErr: unknown
  for (let attempt = 0; attempt < 3; attempt++) {
    const slug = randomSlug()
    try {
      const result = await db
        .prepare(`
          INSERT INTO invoices
            (slug, number, customer_id, status, issue_date, due_date, currency,
             adjustment, adjustment_label, notes, sent_at, created_at, updated_at)
          VALUES (
            ?,
            'INV-' || strftime('%Y','now') || '-' ||
              printf('%04d',
                COALESCE(
                  (SELECT MAX(CAST(substr(number, 10) AS INTEGER))
                     FROM invoices
                    WHERE number LIKE 'INV-' || strftime('%Y','now') || '-%'),
                  0) + 1),
            ?, ?, ?, ?, 'SAR', ?, ?, ?, ?, ?, ?
          )
        `)
        .bind(
          slug,
          body.customer_id,
          status,
          body.issue_date,
          body.due_date,
          adjustment,
          body.adjustment_label?.trim() || null,
          body.notes?.trim() || null,
          status === 'sent' ? now : null,
          now,
          now,
        )
        .run()

      const invoiceId = result.meta?.last_row_id
      if (!invoiceId) throw new Error('No last_row_id returned')

      // Insert items.
      for (let i = 0; i < body.items.length; i++) {
        const it = body.items[i]
        await db
          .prepare('INSERT INTO invoice_items (invoice_id, position, description, amount) VALUES (?, ?, ?, ?)')
          .bind(invoiceId, i, it.description.trim(), Math.trunc(it.amount))
          .run()
      }

      // Read back the assigned number + slug.
      const created = await db
        .prepare('SELECT id, slug, number FROM invoices WHERE id = ?')
        .bind(invoiceId)
        .first<{ id: number; slug: string; number: string }>()

      return { ok: true, invoice: created }
    } catch (e: any) {
      lastErr = e
      // UNIQUE failures on slug or number → retry. Anything else → bail.
      const msg = String(e?.message ?? e)
      if (!/UNIQUE/i.test(msg)) throw e
    }
  }
  throw createError({ statusCode: 500, statusMessage: `Failed to create invoice: ${String(lastErr)}` })
})
