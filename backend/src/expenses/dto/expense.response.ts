import { ApiProperty } from '@nestjs/swagger';

export class ExpenseResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Café Starbucks' })
  description!: string;

  @ApiProperty({ example: '120.50', description: 'Se guarda como string/decimal' })
  amount!: string;

  @ApiProperty({ example: 'food' })
  category!: string;

  @ApiProperty({ example: '2026-01-14T10:30:00.000Z' })
  date!: string;
}
