import { useDB } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const db = useDB(event)
  const settings = await db
    .prepare('SELECT * FROM settings WHERE id = 1')
    .first()
  if (!settings) {
    throw createError({ statusCode: 500, statusMessage: 'Settings row missing — re-run migration 0002_invoices.sql' })
  }
  return { settings }
})
