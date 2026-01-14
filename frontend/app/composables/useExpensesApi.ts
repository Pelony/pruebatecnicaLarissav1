import type { Expense, ExpenseCreate, ExpenseUpdate } from '~/types/expense'

export type ListExpensesParams = {
  page?: number
  pageSize?: number
  q?: string
  category?: string
  sortBy?: 'date' | 'amount' | 'category' | 'description'
  sortDir?: 'ASC' | 'DESC'
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
  sumAmount: string
}

export function useExpensesApi() {
  const config = useRuntimeConfig()

  const baseURL = import.meta.server
    ? (config.apiInternalBaseUrl as string)       
    : (config.public.apiBaseUrl as string)        

  const prefix = '/api'

  const api = $fetch.create({
    baseURL: `${baseURL}${prefix}`,
    headers: { 'Content-Type': 'application/json' },
  })

  return {
    // ✅ Server-side list con paginación y filtros
    list: (params: ListExpensesParams = {}) =>
      api<PaginatedResponse<Expense>>('/expenses', { params }),


    search: (query: string, pageSize = 10) =>
      api<PaginatedResponse<Expense>>('/expenses', {
        params: { q: query, page: 1, pageSize },
      }),

    getById: (id: number) => api<Expense>(`/expenses/${id}`),

    create: (payload: ExpenseCreate) =>
      api<Expense>('/expenses', { method: 'POST', body: payload }),

    update: (id: number, payload: ExpenseUpdate) =>
      api<Expense>(`/expenses/${id}`, { method: 'PUT', body: payload }),

    remove: (id: number) =>
      api<{ deleted: true }>(`/expenses/${id}`, { method: 'DELETE' }),
  }
}
