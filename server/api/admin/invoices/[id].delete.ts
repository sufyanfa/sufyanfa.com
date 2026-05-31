import { useDB } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const db = useDB(event)
  const inv = await db.prepare('SELECT status FROM invoices WHERE id = ?').bind(id).first<{ status: string }>()
  if (!inv) throw createError({ statusCode: 404, statusMessage: 'الفاتورة غير موجودة' })
  if (inv.status !== 'draft') {
    throw createError({ statusCode: 409, statusMessage: 'لا يمكن حذف فاتورة مرسلة أو مدفوعة' })
  }

  await db.prepare('DELETE FROM invoices WHERE id = ?').bind(id).run()
  // invoice_items rows cascade via ON DELETE CASCADE.
  return { ok: true }
})
