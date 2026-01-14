import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class ReportQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  category?: string;

  // YYYY-MM-DD o ISO
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  dateFrom?: Date;

  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  dateTo?: Date;
}

export class ReportByDateQueryDto extends ReportQueryDto {
  // day | month
  @IsOptional()
  @IsIn(['day', 'month'])
  groupBy?: 'day' | 'month' = 'day';
}
