export function useAuth() {
  const auth = useAuthStore();
  const api = useApi();

  async function login(email: string, password: string) {
    const res = await api<{ accessToken: string; user: any }>(
      "/api/auth/login",
      {
        method: "POST",
        body: { email, password },
      }
    );
    auth.setSession(res);
    return res;
  }

  async function logout() {
    try {
      await api("/api/auth/logout", { method: "POST" }); 
    } catch {}
    auth.clearSession();
  }

  return {
    user: computed(() => auth.user),
    accessToken: computed(() => auth.accessToken),
    isLoggedIn: computed(() => auth.isLoggedIn),
    // si quieres roles:
    hasRole: (role: string) => (auth.user?.roles ?? []).includes(role),
    login,
    logout,
  };
}
