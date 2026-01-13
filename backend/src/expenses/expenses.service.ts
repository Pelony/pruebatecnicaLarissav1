import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly repo: Repository<Expense>,
  ) {}

  async findAll() {
    const data = await this.repo.find({ order: { date: 'DESC' } });
    const total = await this.repo.count();
    return { data, total };
  }

  async findOne(id: number) {
    const expense = await this.repo.findOne({ where: { id } });
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async create(dto: CreateExpenseDto) {
    if (dto.amount <= 0) throw new BadRequestException('amount must be > 0');

    const expense = this.repo.create({
      description: dto.description.trim(),
      amount: dto.amount.toFixed(2), // guardamos como string '10.50'
      category: (dto.category ?? 'other').trim(),
      date: dto.date ? new Date(dto.date) : undefined,
    });

    return this.repo.save(expense);
  }

  async update(id: number, dto: UpdateExpenseDto) {
    const expense = await this.findOne(id);

    if (dto.amount !== undefined && dto.amount <= 0) {
      throw new BadRequestException('amount must be > 0');
    }

    if (dto.description !== undefined) expense.description = dto.description.trim();
    if (dto.amount !== undefined) expense.amount = dto.amount.toFixed(2);
    if (dto.category !== undefined) expense.category = dto.category.trim();
    if (dto.date !== undefined) expense.date = new Date(dto.date);

    return this.repo.save(expense);
  }

  async remove(id: number) {
    const expense = await this.findOne(id);
    await this.repo.remove(expense); // hard delete
    return { deleted: true };
  }

  async search(query: string) {
    const q = query?.trim();
    if (!q) throw new BadRequestException('query is required');

    const data = await this.repo.find({
      where: { description: ILike(`%${q}%`) },
      order: { date: 'DESC' },
      take: 50,
    });

    return { data, total: data.length };
  }
}
