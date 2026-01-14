import { ApiProperty } from '@nestjs/swagger';
import { ExpenseResponseDto } from './expense.response';

export class PaginatedExpensesResponseDto {
  @ApiProperty({ type: [ExpenseResponseDto] })
  data!: ExpenseResponseDto[];

  @ApiProperty({ example: 123 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  pageSize!: number;

  @ApiProperty({ example: '2450.75', required: false })
  sumAmount?: string;
}
