import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Expense } from '../domain/expense.entity';
import { ExpensesRepository } from './expenses.repository';

@Injectable()
export class TypeOrmExpensesRepository implements ExpensesRepository {
  constructor(
    @InjectRepository(Expense)
    private readonly repo: Repository<Expense>,
  ) {}

  findAll() {
    return this.repo.find({ order: { date: 'DESC' } });
  }

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  create(data: Partial<Expense>) {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  save(expense: Expense) {
    return this.repo.save(expense);
  }

  async deleteById(id: number) {
    await this.repo.delete({ id });
  }

  searchByDescription(query: string) {
    return this.repo.find({
      where: { description: ILike(`%${query}%`) },
      order: { date: 'DESC' },
      take: 50,
    });
  }
}
