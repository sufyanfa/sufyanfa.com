import type { D1Database } from './db'

export interface InstallmentInput {
  label: string
  percentage: number
  due_date: string
}

export interface InstallmentPlanRow {
  label: string
  percentage: number
  amount: number
  due_date: string
}

/**
 * Builds a validated installment plan from admin input.
 * - No input (or empty array) -> a single 100% installment using fallbackDueDate.
 * - Percentages must sum to exactly 100; amounts are computed with the last
 *   row absorbing the rounding remainder so the sum always equals
 *   invoiceTotal exactly (no floating halalas lost to rounding).
 */
export function buildInstallmentPlan(
  input: InstallmentInput[] | undefined,
  invoiceTotal: number,
  issueDate: string,
  fallbackDueDate: string,
): InstallmentPlanRow[] {
  if (!input || input.length === 0) {
    return [{ label: 'الدفعة الكاملة', percentage: 100, amount: invoiceTotal, due_date: fallbackDueDate }]
  }

  for (const row of input) {
    if (!row.label?.trim()) throw createError({ statusCode: 400, statusMessage: 'وصف الدفعة مطلوب' })
    if (!Number.isFinite(row.percentage) || row.percentage <= 0) {
      throw createError({ statusCode: 400, statusMessage: 'نسبة الدفعة غير صحيحة' })
    }
    if (!row.due_date || row.due_date < issueDate) {
      throw createError({ statusCode: 400, statusMessage: 'تاريخ استحقاق الدفعة غير صحيح' })
    }
  }

  const pctSum = input.reduce((s, r) => s + r.percentage, 0)
  if (pctSum !== 100) {
    throw createError({ statusCode: 400, statusMessage: 'مجموع نسب الدفعات يجب أن يساوي 100%' })
  }
  let allocated = 0
  return input.map((r, idx) => {
    const isLast = idx === input.length - 1
    const amount = isLast ? invoiceTotal - allocated : Math.floor((invoiceTotal * r.percentage) / 100)
    allocated += amount
    return { label: r.label.trim(), percentage: r.percentage, amount, due_date: r.due_date }
  })
}

export async function insertInstallments(db: D1Database, invoiceId: number, plan: InstallmentPlanRow[]): Promise<void> {
  const now = Date.now()
  for (let i = 0; i < plan.length; i++) {
    const p = plan[i]
    await db
      .prepare(`
        INSERT INTO invoice_installments
          (invoice_id, position, label, percentage, amount, due_date, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)
      `)
      .bind(invoiceId, i, p.label, p.percentage, p.amount, p.due_date, now, now)
      .run()
  }
}

export async function replaceInstallments(db: D1Database, invoiceId: number, plan: InstallmentPlanRow[]): Promise<void> {
  const { results } = await db
    .prepare('SELECT status FROM invoice_installments WHERE invoice_id = ?')
    .bind(invoiceId)
    .all<{ status: string }>()
  if (results.some(r => r.status === 'paid')) {
    throw createError({ statusCode: 409, statusMessage: 'لا يمكن تعديل خطة الدفع بعد تسجيل دفعة واحدة على الأقل' })
  }
  await db.prepare('DELETE FROM invoice_installments WHERE invoice_id = ?').bind(invoiceId).run()
  await insertInstallments(db, invoiceId, plan)
}

export function deriveInvoiceStatus(installments: { status: string }[]): 'sent' | 'partially_paid' | 'paid' {
  const paidCount = installments.filter(i => i.status === 'paid').length
  if (paidCount === 0) return 'sent'
  if (paidCount === installments.length) return 'paid'
  return 'partially_paid'
}

export async function recomputeInvoiceStatus(db: D1Database, invoiceId: number): Promise<void> {
  const { results } = await db
    .prepare('SELECT status, paid_at FROM invoice_installments WHERE invoice_id = ?')
    .bind(invoiceId)
    .all<{ status: string; paid_at: number | null }>()
  const status = deriveInvoiceStatus(results)
  const paidAt = status === 'paid'
    ? results.reduce((max, r) => Math.max(max, r.paid_at ?? 0), 0) || null
    : null
  await db
    .prepare('UPDATE invoices SET status = ?, paid_at = ?, updated_at = ? WHERE id = ?')
    .bind(status, paidAt, Date.now(), invoiceId)
    .run()
}
