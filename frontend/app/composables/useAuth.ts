export function useAuth() {
    const auth = useAuthStore()
    const api = useApi()
  
    async function login(email: string, password: string) {
      const res = await api<{ accessToken: string; user: any }>('/auth/login', {
        method: 'POST',
        body: { email, password },
      })
      auth.setSession(res)
      return res
    }
  
    async function logout() {
      // si el access token ya expiró, logout puede dar 401, no pasa nada
      try {
        await api('/auth/logout', { method: 'POST' })
      } catch {}
      auth.clearSession()
    }
  
    return {
      user: computed(() => auth.user),
      accessToken: computed(() => auth.accessToken),
      isLoggedIn: computed(() => auth.isLoggedIn),
      hasRole: auth.hasRole,
      login,
      logout,
    }
  }
  