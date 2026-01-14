import { MigrationInterface, QueryRunner } from 'typeorm'

export class InitAuth1700000000000 implements MigrationInterface {
  name = 'InitAuth1700000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`)

    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar(40) NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_roles_name" UNIQUE ("name"),
        CONSTRAINT "PK_roles_id" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" varchar(190) NOT NULL,
        "passwordHash" varchar(255) NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "refreshTokenHash" varchar(255),
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email")`)

    await queryRunner.query(`
      CREATE TABLE "user_roles" (
        "user_id" uuid NOT NULL,
        "role_id" uuid NOT NULL,
        CONSTRAINT "PK_user_roles" PRIMARY KEY ("user_id", "role_id"),
        CONSTRAINT "FK_user_roles_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_user_roles_role" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `)

    await queryRunner.query(`CREATE INDEX "IDX_user_roles_role_id" ON "user_roles" ("role_id")`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_roles_role_id"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "user_roles"`)

    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_email"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`)

    await queryRunner.query(`DROP TABLE IF EXISTS "roles"`)
  }
}
