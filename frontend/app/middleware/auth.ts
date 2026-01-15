export default defineNuxtRouteMiddleware((to) => {
  if (!to.meta.auth) return
  const auth = useAuthStore()
  if (!auth.isLoggedIn) return navigateTo(`/login?next=${encodeURIComponent(to.fullPath)}`)
})
