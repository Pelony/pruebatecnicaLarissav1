import type { Expense, ExpenseCreate, ExpenseUpdate } from "~/types/expense";

export type ListExpensesParams = {
  page?: number;
  pageSize?: number;
  q?: string;
  category?: string;
  sortBy?: "date" | "amount" | "category" | "description";
  sortDir?: "ASC" | "DESC";
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  sumAmount: string;
};
export type ReportByCategoryRow = {
  category: string;
  total: string;
  count: number;
};
export type ReportByDateRow = { period: string; total: string; count: number };

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function useExpensesApi() {
  const config = useRuntimeConfig();

  const baseURL = import.meta.server
    ? (config.apiInternalBaseUrl as string)
    : (config.public.apiBaseUrl as string);

  const prefix = "/api";

  const api = $fetch.create({
    baseURL: `${baseURL}${prefix}`,
    headers: { "Content-Type": "application/json" },
  });
  async function exportFile(
    format: "csv" | "pdf",
    filename: string,
    params: ListExpensesParams = {}
  ) {
    if (import.meta.server) return;

    const blob = await $fetch<Blob>("/expenses/export", {
      baseURL: `${baseURL}${prefix}`,
      method: "GET",
      responseType: "blob",
      params: {
        format, // 👈 clave
        ...params, // 👈 filtros (q, category, sortBy, sortDir, etc.)
      },
    });

    downloadBlob(blob, filename);
  }

  return {
    // ✅ Server-side list con paginación y filtros
    list: (params: ListExpensesParams = {}) =>
      api<PaginatedResponse<Expense>>("/expenses", { params }),

    search: (query: string, pageSize = 10) =>
      api<PaginatedResponse<Expense>>("/expenses", {
        params: { q: query, page: 1, pageSize },
      }),

    getById: (id: number) => api<Expense>(`/expenses/${id}`),

    create: (payload: ExpenseCreate) =>
      api<Expense>("/expenses", { method: "POST", body: payload }),

    update: (id: number, payload: ExpenseUpdate) =>
      api<Expense>(`/expenses/${id}`, { method: "PUT", body: payload }),

    remove: (id: number) =>
      api<{ deleted: true }>(`/expenses/${id}`, { method: "DELETE" }),

    exportCsv: (params: ListExpensesParams = {}) =>
      exportFile("csv", "expenses.csv", params),

    exportPdf: (params: ListExpensesParams = {}) =>
      exportFile("pdf", "expenses.pdf", params),
    reportByCategory: (
      params: {
        q?: string;
        category?: string;
        dateFrom?: string;
        dateTo?: string;
      } = {}
    ) =>
      api<{ data: ReportByCategoryRow[] }>("/expenses/reports/by-category", {
        params,
      }),

    reportByDate: (
      params: {
        q?: string;
        category?: string;
        dateFrom?: string;
        dateTo?: string;
        groupBy?: "day" | "month";
      } = {}
    ) =>
      api<{ data: ReportByDateRow[] }>("/expenses/reports/by-date", { params }),
  };
}
