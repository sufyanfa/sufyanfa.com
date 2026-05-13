import { useDB } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const session = event.context.adminSession as { uid: number; is_admin: boolean } | undefined
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const db = useDB(event)
  const user = await db
    .prepare('SELECT id, email FROM users WHERE id = ?')
    .bind(session.uid)
    .first<{ id: number; email: string }>()
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  return { id: user.id, email: user.email }
})
