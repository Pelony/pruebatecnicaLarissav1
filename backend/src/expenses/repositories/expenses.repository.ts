import type { Expense } from '../domain/expense.entity';

export const EXPENSES_REPOSITORY = Symbol('EXPENSES_REPOSITORY');

export type FindPagedExpensesParams = {
  page: number;
  pageSize: number;
  q?: string;
  category?: string;
  sortBy: 'date' | 'amount' | 'category' | 'description';
  sortDir: 'ASC' | 'DESC';
};

export type FindPagedExpensesResult = {
  data: Expense[];
  total: number;
  sumAmount: string; 
};

export interface ExpensesRepository {
  findAll(): Promise<Expense[]>;
  findById(id: number): Promise<Expense | null>;
  create(data: Partial<Expense>): Promise<Expense>;
  save(expense: Expense): Promise<Expense>;
  deleteById(id: number): Promise<void>;
  searchByDescription(query: string): Promise<Expense[]>;
  findPaged(params: FindPagedExpensesParams): Promise<FindPagedExpensesResult>;
}
