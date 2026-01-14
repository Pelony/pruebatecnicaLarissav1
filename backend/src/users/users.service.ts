import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserEntity } from './entities/user.entity'

@Injectable()
export class UsersService {
  constructor(@InjectRepository(UserEntity) private repo: Repository<UserEntity>) {}

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } })
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } })
  }

  async setRefreshTokenHash(userId: string, hash: string | null) {
    await this.repo.update({ id: userId }, { refreshTokenHash: hash })
  }
}
