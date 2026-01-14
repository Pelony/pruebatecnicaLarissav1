import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
  ) {}

  private accessExpiresIn(): JwtSignOptions['expiresIn'] {
    // tipado para que TS no rompa overloads
    return (
      (process.env.ACCESS_EXPIRES_IN as JwtSignOptions['expiresIn']) ?? '15m'
    );
  }

  private refreshExpiresIn(): JwtSignOptions['expiresIn'] {
    return (
      (process.env.REFRESH_EXPIRES_IN as JwtSignOptions['expiresIn']) ?? '14d'
    );
  }

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user || !user.isActive)
      throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const roles = (user.roles ?? []).map((r) => String(r.name));

    const accessToken = await this.jwt.signAsync(
      { sub: user.id, roles },
      {
        secret: process.env.JWT_ACCESS_SECRET!,
        expiresIn: this.accessExpiresIn(),
      },
    );

    const refreshToken = await this.jwt.signAsync(
      { sub: user.id },
      {
        secret: process.env.JWT_REFRESH_SECRET!,
        expiresIn: this.refreshExpiresIn(),
      },
    );

    await this.users.setRefreshTokenHash(
      user.id,
      await bcrypt.hash(refreshToken, 12),
    );

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, roles },
    };
  }

  async refresh(refreshToken: string) {
    let payload: any;
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET!,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.users.findById(payload.sub);
    if (!user?.refreshTokenHash || !user.isActive)
      throw new UnauthorizedException();

    const ok = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!ok) throw new UnauthorizedException();

    const roles = (user.roles ?? []).map((r) => String(r.name));

    const accessToken = await this.jwt.signAsync(
      { sub: user.id, roles },
      {
        secret: process.env.JWT_ACCESS_SECRET!,
        expiresIn: this.accessExpiresIn(),
      },
    );

    return { accessToken, user: { id: user.id, email: user.email, roles } };
  }

  async logout(userId: string) {
    await this.users.setRefreshTokenHash(userId, null);
  }
}
