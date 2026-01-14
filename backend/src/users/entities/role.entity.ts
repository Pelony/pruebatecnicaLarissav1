import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm'

export enum RoleName {
  admin = 'admin',
  manager = 'manager',
  user = 'user',
}

@Entity('roles')
@Unique(['name'])
export class RoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 40 })
  name: RoleName

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}
