export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()

  if (to.path === '/login') return

  if (!auth.initialized) {
    await auth.init()
  }

  if (!auth.isLoggedIn) {
    return navigateTo(`/login?next=${encodeURIComponent(to.fullPath)}`)
  }
})
