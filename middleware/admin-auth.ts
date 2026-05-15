export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/admin/login') return
  const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
  try {
    await $fetch('/api/admin/me', { headers })
  } catch {
    return navigateTo('/admin/login')
  }
})
