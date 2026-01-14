import { Controller, Get, UseGuards } from '@nestjs/common'
import { AccessJwtGuard } from '../auth/guards/access-jwt.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'

@Controller('admin')
export class AdminController {

  @Get('ping')
  @UseGuards(AccessJwtGuard, RolesGuard)
  @Roles('admin')
  ping() {
    return {
      ok: true,
      message: 'pong (admin)',
      timestamp: new Date().toISOString(),
    }
  }
}
