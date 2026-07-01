import { useDB } from '~/server/utils/db'
import { verifyJWT } from '~/server/utils/auth'

const LIST_LABELS: Record<string, string> = {
  future: 'مستقبلاً',
  this_week: 'هذا الأسبوع',
  today: 'اليوم',
  in_progress: 'قيد العمل',
  done: 'تم',
}

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') ?? ''
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Missing slug' })

  const db = useDB(event)
  const project = await db
    .prepare('SELECT id, name, customer_id, password_hash, status, start_date, end_date FROM projects WHERE slug = ?')
    .bind(slug)
    .first<any>()

  if (!project || project.status !== 'active') {
    throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  }

  if (project.password_hash) {
    const token = getCookie(event, `__pj_${project.id}`)
    if (!token) throw createError({ statusCode: 401, statusMessage: 'Locked' })
    const secret = useRuntimeConfig().sessionSecret as string
    const payload = await verifyJWT<{ pid: number }>(token, secret)
    if (!payload || payload.pid !== project.id) throw createError({ statusCode: 401, statusMessage: 'Locked' })
  }

  const customer = await db
    .prepare('SELECT name FROM customers WHERE id = ?')
    .bind(project.customer_id)
    .first<{ name: string }>()

  const { results: cards } = await db
    .prepare('SELECT id, title, list_key, position, person_name FROM project_cards WHERE project_id = ? ORDER BY position ASC, created_at ASC')
    .bind(project.id)
    .all() as any

  const cardIds = cards.map((c: any) => c.id)
  let checklistItems: any[] = []
  if (cardIds.length > 0) {
    const placeholders = cardIds.map(() => '?').join(',')
    const { results: items } = await db
      .prepare(`SELECT id, card_id, title, assigned_to, is_complete, position FROM card_checklist_items WHERE card_id IN (${placeholders}) ORDER BY position ASC, created_at ASC`)
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
    .prepare('SELECT id, name, url, description FROM project_resources WHERE project_id = ? ORDER BY created_at DESC')
    .bind(project.id)
    .all() as any

  return {
    project: { name: project.name, start_date: project.start_date, end_date: project.end_date },
    customer_name: customer?.name || '',
    lists,
    resources,
  }
})
