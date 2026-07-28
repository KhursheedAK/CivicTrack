import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfig } from '../../config/configuration';
import { Role } from '../../common/enums/role.enum';

export interface JwtAccessPayload {
  sub: string;
  email: string;
  role: Role;
  department_id: string | null;
  remember?: boolean;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  department_id: string | null;
}

const accessTokenExtractor = (req: Request): string | null => {
  return (req?.cookies?.access_token as string | undefined) ?? null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService<AppConfig, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([accessTokenExtractor]),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt', { infer: true }).accessSecret,
    });
  }

  validate(payload: JwtAccessPayload): AuthenticatedUser {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid access token');
    }
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      department_id: payload.department_id,
    };
  }
}
