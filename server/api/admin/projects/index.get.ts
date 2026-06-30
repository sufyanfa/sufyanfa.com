import { useDB } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const db = useDB(event)
  const { results: projects } = await db
    .prepare(`
      SELECT p.id, p.slug, p.name, p.status, p.start_date, p.end_date, p.created_at,
             c.id AS customer_id, c.name AS customer_name,
             ROUND(
               CAST(
                 COALESCE(
                   (SELECT SUM(ci.is_complete) FROM card_checklist_items ci
                    WHERE ci.card_id IN (SELECT pc.id FROM project_cards pc WHERE pc.project_id = p.id)),
                 0) AS REAL
               ) /
               NULLIF(
                 (SELECT COUNT(*) FROM card_checklist_items ci
                  WHERE ci.card_id IN (SELECT pc.id FROM project_cards pc WHERE pc.project_id = p.id)),
               0) * 100
             ) AS progress
      FROM projects p
      JOIN customers c ON c.id = p.customer_id
      ORDER BY p.created_at DESC
    `)
    .all()
  return { projects }
})
