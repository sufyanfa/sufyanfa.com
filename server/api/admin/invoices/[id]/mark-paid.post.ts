import { useDB } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const db = useDB(event)
  const inv = await db.prepare('SELECT status FROM invoices WHERE id = ?').bind(id).first<{ status: string }>()
  if (!inv) throw createError({ statusCode: 404, statusMessage: 'الفاتورة غير موجودة' })
  if (inv.status === 'draft') {
    throw createError({ statusCode: 409, statusMessage: 'لا يمكن وضع مسودة كمدفوعة. اعرضها أولاً.' })
  }

  const now = Date.now()
  await db
    .prepare(`UPDATE invoices SET status = 'paid', paid_at = COALESCE(paid_at, ?), updated_at = ? WHERE id = ?`)
    .bind(now, now, id)
    .run()
  return { ok: true }
})
