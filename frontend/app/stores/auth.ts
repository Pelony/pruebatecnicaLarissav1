import { defineStore } from 'pinia'

type AuthUser = {
  id: string
  email: string
  roles: string[]
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const user = ref<AuthUser | null>(null)

  const isLoggedIn = computed(() => !!accessToken.value)

  function setSession(payload: { accessToken: string; user: AuthUser }) {
    accessToken.value = payload.accessToken
    user.value = payload.user
  }

  function clearSession() {
    accessToken.value = null
    user.value = null
  }

  return { accessToken, user, isLoggedIn, setSession, clearSession }
})
