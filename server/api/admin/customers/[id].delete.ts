import { useDB } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const db = useDB(event)
  const existing = await db
    .prepare('SELECT COUNT(*) AS n FROM invoices WHERE customer_id = ?')
    .bind(id)
    .first<{ n: number }>()
  if ((existing?.n ?? 0) > 0) {
    throw createError({ statusCode: 409, statusMessage: 'لا يمكن حذف عميل لديه فواتير' })
  }

  await db.prepare('DELETE FROM customers WHERE id = ?').bind(id).run()
  return { ok: true }
})
