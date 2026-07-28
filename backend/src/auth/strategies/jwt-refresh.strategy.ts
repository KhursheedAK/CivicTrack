import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfig } from '../../config/configuration';
import { JwtAccessPayload } from './jwt.strategy';

export interface AuthenticatedRefreshUser extends JwtAccessPayload {
  refreshToken: string;
}

const refreshTokenExtractor = (req: Request): string | null => {
  return (req?.cookies?.refresh_token as string | undefined) ?? null;
};

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService<AppConfig, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([refreshTokenExtractor]),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: configService.get('jwt', { infer: true }).refreshSecret,
    });
  }

  validate(req: Request, payload: JwtAccessPayload): AuthenticatedRefreshUser {
    const refreshToken = req?.cookies?.refresh_token as string | undefined;
    if (!payload.sub || !refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return { ...payload, refreshToken };
  }
}
