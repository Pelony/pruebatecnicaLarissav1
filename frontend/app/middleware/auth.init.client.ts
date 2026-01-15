export default defineNuxtPlugin(async () => {
    const auth = useAuthStore()
  
    // Solo en cliente
    if (!auth.initialized) {
      await auth.init()
    }
  })
  