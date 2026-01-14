type ApiOptions = Parameters<typeof $fetch>[1]

export function useApi() {
  const auth = useAuthStore()
  const config = useRuntimeConfig()

  const baseURL = config.public.apiBaseUrl as string

  const api = async <T>(path: string, options: ApiOptions = {}): Promise<T> => {
    const url = path.startsWith('http') ? path : `${baseURL}${path.startsWith('/') ? '' : '/'}${path}`

    const doFetch = (token?: string | null) => {
      const headers = new Headers(options.headers as HeadersInit | undefined)
      if (token) headers.set('Authorization', `Bearer ${token}`)

      return $fetch<T>(url, {
        ...options,
        credentials: 'include', 
        headers,
      })
    }

    try {
      return await doFetch(auth.accessToken)
    } catch (e: any) {
      const status = e?.response?.status ?? e?.status
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/refresh')

      if (status !== 401 || isAuthEndpoint) {
        throw e
      }

      // intento refresh 1 vez
      try {
        const refreshed = await $fetch<{ accessToken: string; user: any }>(`${baseURL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        })

        auth.setSession(refreshed)
        return await doFetch(auth.accessToken)
      } catch (refreshErr) {
        auth.clearSession()
        throw e
      }
    }
  }

  return api
}
