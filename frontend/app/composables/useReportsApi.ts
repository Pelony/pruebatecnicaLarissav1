export type ReportParams = {
  q?: string;
  category?: string;
  sortBy?: "date" | "amount" | "category" | "description";
  sortDir?: "ASC" | "DESC";
  from?: string; // ISO date (opcional)
  to?: string; // ISO date (opcional)
};

export type CategoryPoint = { label: string; total: string };
export type TimePoint = { label: string; total: string };

export function useReportsApi() {
  const config = useRuntimeConfig();

  const baseURL = import.meta.server
    ? (config.apiInternalBaseUrl as string)
    : (config.public.apiBaseUrl as string);

  const api = $fetch.create({
    baseURL: `${baseURL}/api`,
    headers: { "Content-Type": "application/json" },
  });

  return {
    byCategory: (params: ReportParams = {}) =>
      api<{ data: CategoryPoint[] }>("/reports/expenses/by-category", {
        params,
      }),

    byDate: (params: ReportParams = {}) =>
      api<{ data: TimePoint[] }>("/reports/expenses/by-date", { params }),
  };
}
