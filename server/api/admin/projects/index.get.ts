import { useDB } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const db = useDB(event)
  const { results: projects } = await db
    .prepare(`
      SELECT p.id, p.slug, p.name, p.status, p.start_date, p.end_date, p.created_at,
             c.id AS customer_id, c.name AS customer_name
      FROM projects p
      JOIN customers c ON c.id = p.customer_id
      ORDER BY p.created_at DESC
    `)
    .all()
  return { projects }
})
