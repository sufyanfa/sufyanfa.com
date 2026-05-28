import { useDB } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const db = useDB(event)
  const messages = await db
    .prepare(`
      SELECT 
        m.*,
        c.name as customer_name,
        t.name as template_name
      FROM wa_messages m
      LEFT JOIN customers c ON m.customer_id = c.id
      LEFT JOIN wa_templates t ON m.template_id = t.id
      ORDER BY m.id DESC
      LIMIT 100
    `)
    .all()

  return { messages: messages.results }
})
