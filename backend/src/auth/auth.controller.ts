import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { AccessJwtGuard } from './guards/access-jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const noticeSecure = (process.env.COOKIE_SECURE ?? 'false') === 'true';
    const { accessToken, refreshToken, user } = await this.auth.login(
      dto.email,
      dto.password,
    );


    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/api/auth/refresh',
      maxAge: 14 * 24 * 60 * 60 * 1000,
    })

    return { accessToken, user };
  }

  @Post('refresh')
  async refresh(@Req() req: any) {
    const rt = req.cookies?.refresh_token;
    if (!rt) throw new UnauthorizedException();
    return this.auth.refresh(rt);
  }

  @Post('logout')
  @UseGuards(AccessJwtGuard)
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    await this.auth.logout(req.user.sub);
    res.clearCookie('refresh_token', {
      path: '/api/auth/refresh',
    })
    return { ok: true };
  }

  @Get('me')
  @UseGuards(AccessJwtGuard)
  me(@Req() req: any) {
    return { id: req.user.sub, roles: req.user.roles };
  }
}
