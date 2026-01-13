import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from '../domain/expense.entity';
import type { ExpensesRepository, FindPagedExpensesParams } from './expenses.repository';

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
    // podrías deprecarlo luego, pero lo dejamos
    return this.repo.find({
      where: { description: query ? (undefined as any) : (undefined as any) }, // no lo uses ya
      order: { date: 'DESC' },
      take: 50,
    });
  }

  async findPaged(params: FindPagedExpensesParams) {
    const { page, pageSize, q, category, sortBy, sortDir } = params;
    const skip = (page - 1) * pageSize;

    const qb = this.repo.createQueryBuilder('e');

    if (q && q.trim()) {
      const qq = `%${q.trim().toLowerCase()}%`;
      qb.andWhere('(LOWER(e.description) LIKE :q OR LOWER(e.category) LIKE :q)', { q: qq });
    }

    if (category && category.trim()) {
      qb.andWhere('LOWER(e.category) = :cat', { cat: category.trim().toLowerCase() });
    }

    qb.orderBy(`e.${sortBy}`, sortDir)
      .skip(skip)
      .take(pageSize);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }
}
