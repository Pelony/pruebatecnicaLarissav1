import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { UserEntity } from '../users/entities/user.entity'
import { RoleEntity } from '../users/entities/role.entity'

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [UserEntity, RoleEntity],
  migrations: ['dist/database/migrations/*.js'],
  synchronize: false,
  logging: false,
})
