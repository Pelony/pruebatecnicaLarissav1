type ApiOptions = Parameters<typeof $fetch>[1];

export function useApi() {
  const auth = useAuthStore();
  const config = useRuntimeConfig();

  const baseURL = String(config.public.apiBaseUrl || "").replace(/\/$/, "");
  if (!baseURL) throw new Error("Missing runtimeConfig.public.apiBaseUrl");

  const api = async <T>(path: string, options: ApiOptions = {}): Promise<T> => {
    const url = path.startsWith("http")
      ? path
      : `${baseURL}${path.startsWith("/") ? "" : "/"}${path}`;

    const doFetch = (token?: string | null) => {
      const headers = new Headers(options.headers as HeadersInit | undefined);
      if (token) headers.set("Authorization", `Bearer ${token}`);

      return $fetch<T>(url, {
        ...options,
        credentials: "include",
        headers,
      });
    };

    try {
      return await doFetch(auth.accessToken);
    } catch (e: any) {
      const status = e?.response?.status ?? e?.status;

      const isAuthEndpoint =
        url.includes("/api/auth/login") ||
        url.includes("/api/auth/refresh") ||
        url.includes("/api/auth/logout");

      if (status !== 401 || isAuthEndpoint) throw e;

      try {
        const refreshed = await $fetch<{ accessToken: string; user: any }>(
          `${baseURL}/api/auth/refresh`,
          {
            method: "POST",
            credentials: "include",
            headers: process.server ? useRequestHeaders(['cookie']) : undefined
          }
        );

        auth.setSession(refreshed);
        return await doFetch(auth.accessToken);
      } catch {
        auth.clearSession();
        throw e;
      }
    }
  };

  return api;
}
