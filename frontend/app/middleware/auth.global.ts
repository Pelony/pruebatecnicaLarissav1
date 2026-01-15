export default defineNuxtRouteMiddleware((to) => {
    const auth = useAuthStore()
  
    // Login siempre permitido
    if (to.path === '/login') return
  
    // Solo bloquea si YA sabemos que no hay sesión
    if (auth.initialized && !auth.isLoggedIn) {
      return navigateTo(`/login?next=${encodeURIComponent(to.fullPath)}`)
    }
  })
  