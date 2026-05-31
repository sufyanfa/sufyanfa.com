import { useDB } from '~/server/utils/db'

interface ItemInput {
  description: string
  amount: number
}

interface UpdateBody {
  customer_id: number
  issue_date: string
  due_date: string
  items: ItemInput[]
  adjustment?: number
  adjustment_label?: string
  notes?: string
}

function isISODate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s)
}

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const body = await readBody<UpdateBody>(event)
  if (!body) throw createError({ statusCode: 400, statusMessage: 'Body required' })
  if (!Number.isFinite(body.customer_id)) throw createError({ statusCode: 400, statusMessage: 'العميل مطلوب' })
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
    if (!it.description?.trim()) throw createError({ statusCode: 400, statusMessage: 'وصف البند مطلوب' })
    if (!Number.isFinite(it.amount) || it.amount < 0) throw createError({ statusCode: 400, statusMessage: 'مبلغ البند غير صحيح' })
  }

  const db = useDB(event)

  const cust = await db.prepare('SELECT id FROM customers WHERE id = ?').bind(body.customer_id).first()
  if (!cust) throw createError({ statusCode: 400, statusMessage: 'العميل غير موجود' })

  const adjustment = Number.isFinite(body.adjustment) ? Math.trunc(body.adjustment as number) : 0

  const result = await db
    .prepare(`
      UPDATE invoices SET
        customer_id = ?, issue_date = ?, due_date = ?,
        adjustment = ?, adjustment_label = ?, notes = ?,
        updated_at = ?
      WHERE id = ?
    `)
    .bind(
      body.customer_id,
      body.issue_date,
      body.due_date,
      adjustment,
      body.adjustment_label?.trim() || null,
      body.notes?.trim() || null,
      Date.now(),
      id,
    )
    .run()

  if (!result.meta?.changes) {
    throw createError({ statusCode: 404, statusMessage: 'الفاتورة غير موجودة' })
  }

  // Replace items: delete + reinsert (simplest, correct, low row counts).
  await db.prepare('DELETE FROM invoice_items WHERE invoice_id = ?').bind(id).run()
  for (let i = 0; i < body.items.length; i++) {
    const it = body.items[i]
    await db
      .prepare('INSERT INTO invoice_items (invoice_id, position, description, amount) VALUES (?, ?, ?, ?)')
      .bind(id, i, it.description.trim(), Math.trunc(it.amount))
      .run()
  }

  return { ok: true }
})
