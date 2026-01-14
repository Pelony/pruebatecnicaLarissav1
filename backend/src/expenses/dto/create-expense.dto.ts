import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateExpenseDto {
  @ApiProperty({ example: 'Café Starbucks', maxLength: 300 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  description!: string;

  @ApiProperty({ example: 120.50 })
  @IsNumber()
  amount!: number;

  @ApiPropertyOptional({ example: 'food', default: 'other' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: '2026-01-14T10:30:00.000Z' })
  @IsOptional()
  @IsString()
  date?: string;
}
