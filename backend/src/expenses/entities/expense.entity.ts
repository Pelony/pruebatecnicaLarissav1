import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'expenses' })
export class Expense {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  amount!: string;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  date!: Date;

  @Column({ type: 'varchar', length: 50 })
  category!: string;
}
