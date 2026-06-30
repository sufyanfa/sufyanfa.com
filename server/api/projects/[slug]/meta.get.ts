import { useDB } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') ?? ''
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Missing slug' })

  const db = useDB(event)
  const project = await db
    .prepare('SELECT id, name, customer_id, status, start_date, end_date FROM projects WHERE slug = ? AND password_hash != ?')
    .bind(slug, '')
    .first<any>()

  if (!project || project.status !== 'active') {
    throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  }

  const customer = await db
    .prepare('SELECT name FROM customers WHERE id = ?')
    .bind(project.customer_id)
    .first<{ name: string }>()

  return {
    name: project.name,
    customer_name: customer?.name || '',
    start_date: project.start_date,
    end_date: project.end_date,
  }
})
