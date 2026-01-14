import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { EXPENSES_REPOSITORY } from './repositories/expenses.repository';
import type { ExpensesRepository } from './repositories/expenses.repository';
import { ListExpensesQueryDto } from './dto/list-expenses.query';
import { CsvExporter } from './export/csv.exporter';
import { PdfExporter } from './export/pdf.exporter';
import { ReportByDateQueryDto, ReportQueryDto } from './dto/report.query';
import {
  ReportByCategoryRow,
  ReportByDateRow,
} from './repositories/expenses.repository';

type ExportFormat = 'csv' | 'pdf';

@Injectable()
export class ExpensesService {
  constructor(
    @Inject(EXPENSES_REPOSITORY)
    private readonly expensesRepo: ExpensesRepository,
  ) {}

  async list(query: ListExpensesQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;

    const q = query.q?.trim() || undefined;
    const category = query.category?.trim() || undefined;

    const sortBy = query.sortBy ?? 'date';
    const sortDir = query.sortDir ?? 'DESC';

    const { data, total, sumAmount } = await this.expensesRepo.findPaged({
      page,
      pageSize,
      q,
      category,
      sortBy,
      sortDir,
    });

    return { data, total, page, pageSize, sumAmount };
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

    if (dto.description !== undefined)
      expense.description = dto.description.trim();
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
  async categories() {
    const data = await this.expensesRepo.findCategories();
    return { data };
  }
  async export(query: ListExpensesQueryDto, format: ExportFormat) {
    const q = query.q?.trim() || undefined;
    const category = query.category?.trim() || undefined;

    const sortBy = query.sortBy ?? 'date';
    const sortDir = query.sortDir ?? 'DESC';

    const rows = await this.expensesRepo.findForExport({
      q,
      category,
      sortBy,
      sortDir,
      limit: 5000,
    });

    if (format === 'csv') {
      const exporter = new CsvExporter();
      return {
        buffer: exporter.toBuffer(rows),
        contentType: 'text/csv; charset=utf-8',
        ext: 'csv',
      };
    }

    const exporter = new PdfExporter();
    return {
      buffer: await exporter.toBuffer(rows),
      contentType: 'application/pdf',
      ext: 'pdf',
    };
  }
  async reportByCategory(
    query: ReportQueryDto,
  ): Promise<{ data: ReportByCategoryRow[] }> {
    const data = await this.expensesRepo.reportByCategory({
      q: query.q?.trim() || undefined,
      category: query.category?.trim() || undefined,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    });
    return { data };
  }
  async reportByDate(
    query: ReportByDateQueryDto,
  ): Promise<{ data: ReportByDateRow[] }> {
    const data = await this.expensesRepo.reportByDate({
      q: query.q?.trim() || undefined,
      category: query.category?.trim() || undefined,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      groupBy: query.groupBy ?? 'day',
    });
    return { data };
  }
}
