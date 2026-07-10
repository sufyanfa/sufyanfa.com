import { useDB } from '~/server/utils/db'
import { recomputeInvoiceStatus } from '~/server/utils/installments'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const iid = Number(getRouterParam(event, 'iid'))
  if (!Number.isFinite(id) || !Number.isFinite(iid)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const db = useDB(event)
  const inv = await db.prepare('SELECT status FROM invoices WHERE id = ?').bind(id).first<{ status: string }>()
  if (!inv) throw createError({ statusCode: 404, statusMessage: 'الفاتورة غير موجودة' })
  if (inv.status === 'draft') {
    throw createError({ statusCode: 409, statusMessage: 'لا يمكن وضع مسودة كمدفوعة. اعرضها أولاً.' })
  }

  const installment = await db
    .prepare('SELECT id, status FROM invoice_installments WHERE id = ? AND invoice_id = ?')
    .bind(iid, id)
    .first<{ id: number; status: string }>()
  if (!installment) throw createError({ statusCode: 404, statusMessage: 'الدفعة غير موجودة' })
  if (installment.status === 'paid') {
    throw createError({ statusCode: 409, statusMessage: 'هذه الدفعة مدفوعة بالفعل' })
  }

  const now = Date.now()
  await db
    .prepare(`UPDATE invoice_installments SET status = 'paid', paid_at = ?, updated_at = ? WHERE id = ?`)
    .bind(now, now, iid)
    .run()
  await recomputeInvoiceStatus(db, id)
  return { ok: true }
})
