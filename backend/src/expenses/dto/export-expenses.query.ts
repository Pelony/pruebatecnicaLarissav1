import { IsIn, IsOptional } from 'class-validator'
import { ListExpensesQueryDto } from './list-expenses.query'

export class ExportExpensesQueryDto extends ListExpensesQueryDto {
  @IsOptional()
  @IsIn(['csv', 'pdf'])
  format?: 'csv' | 'pdf' = 'csv'
}
