import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpensesService } from './expenses.service';
import { ListExpensesQueryDto } from './dto/list-expenses.query';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get('categories')
  categories() {
    return this.expensesService.categories();
  }
  @Get('search')
  search(@Query('query') query: string) {
    // Internamente lo mapeamos a list paginado (page=1, pageSize=50)
    return this.expensesService.list({
      page: 1,
      pageSize: 50,
      q: query,
      sortBy: 'date',
      sortDir: 'DESC',
    } as any);
  }

  // GET /api/expenses?page=&pageSize=&q=&category=&sortBy=&sortDir=
  @Get()
  list(@Query() query: ListExpensesQueryDto) {
    return this.expensesService.list(query);
  }

  // GET /api/expenses/:id
  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.expensesService.getById(id);
  }

  // POST /api/expenses
  @Post()
  create(@Body() dto: CreateExpenseDto) {
    return this.expensesService.create(dto);
  }

  // PUT /api/expenses/:id
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateExpenseDto) {
    return this.expensesService.update(id, dto);
  }

  // DELETE /api/expenses/:id
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.expensesService.remove(id);
  }
}
