import type { Expense } from '../domain/expense.entity';

export const EXPENSES_REPOSITORY = Symbol('EXPENSES_REPOSITORY');

export type FindPagedExpensesParams = {
  page: number;
  pageSize: number;
  q?: string;
  category?: string;
  sortBy: 'date' | 'amount' | 'category' | 'description';
  sortDir: 'ASC' | 'DESC';
  limit?: number;
};

export type FindPagedExpensesResult = {
  data: Expense[];
  total: number;
  sumAmount: string;
};
export type FindExportExpensesParams = {
  q?: string;
  category?: string;
  sortBy: 'date' | 'amount' | 'category' | 'description';
  sortDir: 'ASC' | 'DESC';
  limit?: number;
};
export type ReportByCategoryRow = {
  category: string;
  total: string; // sum(amount)
  count: number;
};

export type ReportByDateRow = {
  period: string; // '2026-01-14' o '2026-01'
  total: string;
  count: number;
};

export interface ExpensesRepository {
  findAll(): Promise<Expense[]>;
  findById(id: number): Promise<Expense | null>;
  create(data: Partial<Expense>): Promise<Expense>;
  save(expense: Expense): Promise<Expense>;
  deleteById(id: number): Promise<void>;
  searchByDescription(query: string): Promise<Expense[]>;
  findPaged(params: FindPagedExpensesParams): Promise<FindPagedExpensesResult>;
  findCategories(): Promise<string[]>;
  findForExport(params: FindExportExpensesParams): Promise<Expense[]>;
  reportByCategory(params: {
    q?: string;
    category?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<ReportByCategoryRow[]>;

  reportByDate(params: {
    q?: string;
    category?: string;
    dateFrom?: Date;
    dateTo?: Date;
    groupBy: 'day' | 'month';
  }): Promise<ReportByDateRow[]>;
}
