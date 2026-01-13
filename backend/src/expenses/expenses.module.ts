import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from './domain/expense.entity';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { EXPENSES_REPOSITORY } from './repositories/expenses.repository';
import { TypeOrmExpensesRepository } from './repositories/typeorm-expenses.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Expense])],
  controllers: [ExpensesController],
  providers: [
    ExpensesService,
    TypeOrmExpensesRepository,
    { provide: EXPENSES_REPOSITORY, useExisting: TypeOrmExpensesRepository },
  ],
})
export class ExpensesModule {}
