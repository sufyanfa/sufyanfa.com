import { useDB } from '~/server/utils/db'

const LIST_LABELS: Record<string, string> = {
  future: 'مستقبلاً',
  this_week: 'هذا الأسبوع',
  today: 'اليوم',
  in_progress: 'قيد العمل',
  done: 'تم',
}

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const db = useDB(event)
  const project = await db.prepare('SELECT * FROM projects WHERE id = ?').bind(id).first() as any
  if (!project) throw createError({ statusCode: 404, statusMessage: 'المشروع غير موجود' })

  delete project.password_hash

  const customer = await db.prepare('SELECT id, name FROM customers WHERE id = ?').bind(project.customer_id).first()

  const { results: cards } = await db
    .prepare('SELECT * FROM project_cards WHERE project_id = ? ORDER BY position ASC, created_at ASC')
    .bind(id)
    .all() as any

  const cardIds = cards.map((c: any) => c.id)
  let checklistItems: any[] = []
  if (cardIds.length > 0) {
    const placeholders = cardIds.map(() => '?').join(',')
    const { results: items } = await db
      .prepare(`SELECT * FROM card_checklist_items WHERE card_id IN (${placeholders}) ORDER BY position ASC, created_at ASC`)
      .bind(...cardIds)
      .all() as any
    checklistItems = items
  }

  const itemsByCard: Record<number, any[]> = {}
  for (const item of checklistItems) {
    if (!itemsByCard[item.card_id]) itemsByCard[item.card_id] = []
    itemsByCard[item.card_id].push(item)
  }

  const lists: Record<string, { label: string; cards: any[] }> = {}
  for (const [key, label] of Object.entries(LIST_LABELS)) {
    lists[key] = { label, cards: [] }
  }
  for (const card of cards) {
    card.checklist = itemsByCard[card.id] || []
    if (lists[card.list_key]) {
      lists[card.list_key].cards.push(card)
    }
  }

  const { results: resources } = await db
    .prepare('SELECT * FROM project_resources WHERE project_id = ? ORDER BY created_at DESC')
    .bind(id)
    .all() as any

  return { project, customer, lists, resources }
})
