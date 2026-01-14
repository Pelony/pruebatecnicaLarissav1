import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from '../domain/expense.entity';
import type {
  ExpensesRepository,
  FindPagedExpensesParams,
  FindExportExpensesParams,
} from './expenses.repository';

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

  async searchByDescription(query: string) {
    const q = (query ?? '').trim();
    if (!q) return [];

    return this.repo
      .createQueryBuilder('e')
      .where('e.description ILIKE :q', { q: `%${q}%` })
      .orderBy('e.date', 'DESC')
      .take(50)
      .getMany();
  }

  async findPaged(params: FindPagedExpensesParams) {
    const { page, pageSize, q, category, sortBy, sortDir } = params;
    const skip = (page - 1) * pageSize;

    // 1) Query base con filtros
    const base = this.repo.createQueryBuilder('e');

    if (q && q.trim()) {
      const qq = `%${q.trim().toLowerCase()}%`;
      base.andWhere(
        '(LOWER(e.description) LIKE :q OR LOWER(e.category) LIKE :q)',
        { q: qq },
      );
    }

    if (category && category.trim()) {
      base.andWhere('LOWER(e.category) = :cat', {
        cat: category.trim().toLowerCase(),
      });
    }

    // 2) Total (count) + Sum (sin paginar)
    const sumQb = base.clone().select('COALESCE(SUM(e.amount), 0)', 'sum');
    const sumRow = await sumQb.getRawOne<{ sum: string }>();
    const sumAmount = String(sumRow?.sum ?? '0');

    // 3) Data paginada
    const dataQb = base
      .clone()
      .orderBy(`e.${sortBy}`, sortDir)
      .skip(skip)
      .take(pageSize);

    const [data, total] = await dataQb.getManyAndCount();

    return { data, total, sumAmount };
  }
  async findCategories(): Promise<string[]> {
    const rows = await this.repo
      .createQueryBuilder('e')
      .select('DISTINCT e.category', 'category')
      .where('e.category IS NOT NULL')
      .andWhere("TRIM(e.category) <> ''")
      .orderBy('e.category', 'ASC')
      .getRawMany<{ category: string }>();

    return rows.map((r) => r.category);
  }
  async findForExport(params: FindExportExpensesParams) {
    const { q, category, sortBy, sortDir, limit = 5000 } = params;

    const qb = this.repo.createQueryBuilder('e');

    if (q && q.trim()) {
      const qq = `%${q.trim().toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(e.description) LIKE :q OR LOWER(e.category) LIKE :q)',
        { q: qq },
      );
    }

    if (category && category.trim()) {
      qb.andWhere('LOWER(e.category) = :cat', {
        cat: category.trim().toLowerCase(),
      });
    }

    qb.orderBy(`e.${sortBy}`, sortDir).take(limit);

    return qb.getMany();
  }
}
