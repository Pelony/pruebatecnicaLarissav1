export function useApi() {
    const config = useRuntimeConfig()
  
    const baseURL = config.public.apiBaseUrl
    const prefix = '/api' 
  
    const apiFetch = $fetch.create({
      baseURL: `${baseURL}${prefix}`,
      headers: { 'Content-Type': 'application/json' },
    })
  
    return { apiFetch }
  }
  