import { getAdminSession } from '../utils/auth'

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event).pathname
  if (!url.startsWith('/api/admin/')) return
  // Login + me endpoints handle their own auth
  if (url === '/api/admin/login') return

  const session = await getAdminSession(event)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  event.context.adminSession = session
})
