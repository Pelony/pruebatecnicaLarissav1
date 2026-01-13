import { Expense } from '../domain/expense.entity';

export const EXPENSES_REPOSITORY = Symbol('EXPENSES_REPOSITORY');

export interface ExpensesRepository {
  findAll(): Promise<Expense[]>;
  findById(id: number): Promise<Expense | null>;
  create(data: Partial<Expense>): Promise<Expense>;
  save(expense: Expense): Promise<Expense>;
  deleteById(id: number): Promise<void>;
  searchByDescription(query: string): Promise<Expense[]>;
}
