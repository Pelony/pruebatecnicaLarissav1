import type { Expense, ExpenseCreate, ExpenseUpdate } from '~/types/expense'

export function useExpensesApi() {
  const config = useRuntimeConfig()

  const baseURL = import.meta.server
    ? (config.apiInternalBaseUrl as string)   // SSR dentro de docker
    : (config.public.apiBaseUrl as string)   // browser

  const prefix = '/api' 

  const api = $fetch.create({
    baseURL: `http://localhost:3000${prefix}`,
    headers: { 'Content-Type': 'application/json' },
  })

  return {
    list: () => api<{ data: Expense[]; total: number }>('/expenses'),
    search: (query: string) =>
      api<{ data: Expense[]; total: number }>(`/expenses/search?query=${encodeURIComponent(query)}`),
    create: (payload: ExpenseCreate) => api<Expense>('/expenses', { method: 'POST', body: payload }),
    update: (id: number, payload: ExpenseUpdate) =>
      api<Expense>(`/expenses/${id}`, { method: 'PUT', body: payload }),
    remove: (id: number) => api<{ deleted: true }>(`/expenses/${id}`, { method: 'DELETE' }),
  }
}
