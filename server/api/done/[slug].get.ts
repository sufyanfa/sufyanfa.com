import { useDB } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Invalid slug' })

  const db = useDB(event)
  const project = await db
    .prepare('SELECT id, name, slug, customer_id, completion_md FROM projects WHERE slug = ?')
    .bind(slug)
    .first<any>()

  if (!project || !project.completion_md || !String(project.completion_md).trim()) {
    throw createError({ statusCode: 404, statusMessage: 'الصفحة غير موجودة' })
  }

  const customer = await db
    .prepare('SELECT name FROM customers WHERE id = ?')
    .bind(project.customer_id)
    .first()

  const settings = await db
    .prepare('SELECT business_name, logo_url FROM settings WHERE id = 1')
    .first()

  return {
    project: { name: project.name, slug: project.slug },
    customer,
    completion_md: project.completion_md,
    settings,
  }
})
