import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpensesService } from './expenses.service';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  // GET /api/expenses/search?query=
  @Get('search')
  search(@Query('query') query: string) {
    return this.expensesService.search(query);
  }

  // GET /api/expenses
  @Get()
  list() {
    return this.expensesService.list();
  }

  // GET /api/expenses/:id
  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.expensesService.getById(Number(id));
  }

  // POST /api/expenses
  @Post()
  create(@Body() dto: CreateExpenseDto) {
    return this.expensesService.create(dto);
  }

  // PUT /api/expenses/:id
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateExpenseDto) {
    return this.expensesService.update(Number(id), dto);
  }

  // DELETE /api/expenses/:id
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expensesService.remove(Number(id));
  }
}
