import { AppDataSource } from './data-source'

async function main() {
  await AppDataSource.initialize()
  await AppDataSource.runMigrations()
  await AppDataSource.destroy()
  console.log('✅ Migrations ejecutadas')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
