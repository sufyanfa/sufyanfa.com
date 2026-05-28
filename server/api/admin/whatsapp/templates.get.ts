import { useDB } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const db = useDB(event)
  const templates = await db
    .prepare('SELECT * FROM wa_templates ORDER BY id DESC')
    .all()
  return { templates: templates.results }
})
