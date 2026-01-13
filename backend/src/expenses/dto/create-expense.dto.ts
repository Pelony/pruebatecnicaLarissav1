import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  amount!: number;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  date?: string;
}
