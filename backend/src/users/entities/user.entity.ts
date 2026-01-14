import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
  } from 'typeorm'
  import { RoleEntity } from './role.entity'
  
  @Entity('users')
  @Unique(['email'])
  export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string
  
    @Index()
    @Column({ type: 'varchar', length: 190 })
    email: string
  
    @Column({ type: 'varchar', length: 255 })
    passwordHash: string
  
    @Column({ type: 'boolean', default: true })
    isActive: boolean
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    refreshTokenHash: string | null
  
    @ManyToMany(() => RoleEntity, { eager: true })
    @JoinTable({
      name: 'user_roles',
      joinColumn: { name: 'user_id', referencedColumnName: 'id' },
      inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
    })
    roles: RoleEntity[]
  
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date
  
    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date
  }
  