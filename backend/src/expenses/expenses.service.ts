import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { EXPENSES_REPOSITORY, ExpensesRepository } from './repositories/expenses.repository';

@Injectable()
export class ExpensesService {
  constructor(
    @Inject(EXPENSES_REPOSITORY)
    private readonly expensesRepo: ExpensesRepository,
  ) {}

  async list() {
    const data = await this.expensesRepo.findAll();
    return { data, total: data.length };
  }

  async getById(id: number) {
    const expense = await this.expensesRepo.findById(id);
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async create(dto: CreateExpenseDto) {
    if (dto.amount <= 0) throw new BadRequestException('amount must be > 0');

    return this.expensesRepo.create({
      description: dto.description.trim(),
      amount: dto.amount.toFixed(2),
      category: (dto.category ?? 'other').trim(),
      date: dto.date ? new Date(dto.date) : undefined,
    });
  }

  async update(id: number, dto: UpdateExpenseDto) {
    const expense = await this.getById(id);

    if (dto.amount !== undefined && dto.amount <= 0) {
      throw new BadRequestException('amount must be > 0');
    }

    if (dto.description !== undefined) expense.description = dto.description.trim();
    if (dto.amount !== undefined) expense.amount = dto.amount.toFixed(2);
    if (dto.category !== undefined) expense.category = dto.category.trim();
    if (dto.date !== undefined) expense.date = new Date(dto.date);

    return this.expensesRepo.save(expense);
  }

  async remove(id: number) {
    // valida existencia
    await this.getById(id);
    await this.expensesRepo.deleteById(id);
    return { deleted: true };
  }

  async search(query: string) {
    const q = query?.trim();
    if (!q) throw new BadRequestException('query is required');

    const data = await this.expensesRepo.searchByDescription(q);
    return { data, total: data.length };
  }
}
