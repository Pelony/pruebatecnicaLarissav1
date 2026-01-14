export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()

  if (to.path === '/login') return
  if (!auth.isLoggedIn) {
    return navigateTo(`/login?next=${encodeURIComponent(to.fullPath)}`)
  }
})
