import { defineStore } from "pinia";

type AuthUser = { id: string; email: string; roles: string[] };

export const useAuthStore = defineStore("auth", () => {
  const accessToken = ref<string | null>(null);
  const user = ref<AuthUser | null>(null);

  // 👇 clave: para no reintentar refresh en cada navegación
  const initialized = ref(false);
  const initializing = ref<Promise<void> | null>(null);

  const isLoggedIn = computed(() => !!accessToken.value);

  function setSession(payload: { accessToken: string; user: AuthUser }) {
    accessToken.value = payload.accessToken;
    user.value = payload.user;
  }

  function clearSession() {
    accessToken.value = null;
    user.value = null;
  }

  async function init() {
    if (initialized.value) return;
    if (initializing.value) return initializing.value;

    initializing.value = (async () => {
      try {
        const api = useApi();
        const headers = process.server
          ? useRequestHeaders(["cookie"])
          : undefined;

        const res = await api<{ accessToken: string; user: AuthUser }>(
          "/api/auth/refresh",
          { method: "POST", headers }
        );

        setSession(res);
      } catch {
        clearSession();
      } finally {
        initialized.value = true;
        initializing.value = null;
      }
    })();

    return initializing.value;
  }

  return {
    accessToken,
    user,
    isLoggedIn,
    setSession,
    clearSession,
    init,
    initialized,
  };
});
