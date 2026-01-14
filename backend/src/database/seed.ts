import * as bcrypt from 'bcrypt'
import { AppDataSource } from './data-source'
import { RoleEntity, RoleName } from '../users/entities/role.entity'
import { UserEntity } from '../users/entities/user.entity'

async function main() {
  await AppDataSource.initialize()

  const roleRepo = AppDataSource.getRepository(RoleEntity)
  const userRepo = AppDataSource.getRepository(UserEntity)

  // roles base
  const roleNames = [RoleName.admin, RoleName.manager, RoleName.user]
  const roles: RoleEntity[] = []

  for (const name of roleNames) {
    let r = await roleRepo.findOne({ where: { name } })
    if (!r) r = await roleRepo.save(roleRepo.create({ name }))
    roles.push(r)
  }

  // admin
  const adminEmail = 'admin@myapp.com'
  const adminPass = 'password' 
  const passwordHash = await bcrypt.hash(adminPass, 12)

  let admin = await userRepo.findOne({ where: { email: adminEmail } })
  if (!admin) {
    admin = userRepo.create({
      email: adminEmail,
      passwordHash,
      isActive: true,
      roles: [roles.find(r => r.name === RoleName.admin)!],
    })
  } else {
    admin.passwordHash = passwordHash
    admin.isActive = true
    admin.roles = Array.from(new Map([...(admin.roles ?? []), roles.find(r => r.name === RoleName.admin)!].map(x => [x.id, x])).values())
  }

  await userRepo.save(admin)

  console.log('✅ Seed listo')
  console.log(`Admin: ${adminEmail} / ${adminPass}`)

  await AppDataSource.destroy()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
