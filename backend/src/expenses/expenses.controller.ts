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
  Res,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';

import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ListExpensesQueryDto } from './dto/list-expenses.query';
import { ExportExpensesQueryDto } from './dto/export-expenses.query';
import { ExpenseResponseDto } from './dto/expense.response';
import { PaginatedExpensesResponseDto } from './dto/paginated-expenses.response';

@ApiTags('expenses')
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get('export')
  async export(@Query() query: ExportExpensesQueryDto, @Res() res: Response) {
    const { format = 'csv', ...listQuery } = query;

    const { buffer, contentType, ext } = await this.expensesService.export(
      listQuery,
      format,
    );

    const filename = `expenses-${new Date().toISOString().slice(0, 10)}.${ext}`;
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(buffer);
  }

  @ApiOperation({ summary: 'Lista de categorías existentes' })
  @ApiOkResponse({ schema: { example: ['food', 'transport', 'other'] } })
  @Get('categories')
  categories() {
    return this.expensesService.categories();
  }

  @ApiOperation({ summary: 'Buscar gastos (alias de list con q, page=1)' })
  @ApiOkResponse({ type: PaginatedExpensesResponseDto })
  @ApiBadRequestResponse({
    schema: {
      example: {
        statusCode: 400,
        message: 'query is required',
        error: 'Bad Request',
      },
    },
  })
  @Get('search')
  search(@Query('query') query: string) {
    return this.expensesService.list({
      page: 1,
      pageSize: 50,
      q: query,
      sortBy: 'date',
      sortDir: 'DESC',
    } as any);
  }

  @ApiOperation({ summary: 'Lista paginada de gastos' })
  @ApiOkResponse({ type: PaginatedExpensesResponseDto })
  @Get()
  list(@Query() query: ListExpensesQueryDto) {
    return this.expensesService.list(query);
  }

  @ApiOperation({ summary: 'Obtener gasto por id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: ExpenseResponseDto })
  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.expensesService.getById(id);
  }

  @ApiOperation({ summary: 'Crear un gasto' })
  @ApiCreatedResponse({ type: ExpenseResponseDto })
  @ApiBadRequestResponse({ description: 'Validación fallida' })
  @Post()
  create(@Body() dto: CreateExpenseDto) {
    return this.expensesService.create(dto);
  }

  @ApiOperation({ summary: 'Actualizar un gasto' })
  @ApiOkResponse({ type: ExpenseResponseDto })
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateExpenseDto) {
    return this.expensesService.update(id, dto);
  }

  @ApiOperation({ summary: 'Eliminar un gasto' })
  @ApiOkResponse({ schema: { example: { deleted: true } } })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.expensesService.remove(id);
  }
}
