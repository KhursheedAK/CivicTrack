import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { AppConfig } from '../config/configuration';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { User } from '../users/entities/user.entity';
import { Role } from '../common/enums/role.enum';
import { RegisterDto } from './dto/register.dto';
import { JwtAccessPayload } from './strategies/jwt.strategy';

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
const REFRESH_TOKEN_HASH_ROUNDS = 10;

// Citizens get long-lived sessions for convenience. Officers/admins can see and act on
// other people's data, so a lost/unattended device is a bigger deal for them — their
// refresh window is capped much shorter, "remember" or not.
const CITIZEN_DEFAULT_REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const CITIZEN_REMEMBERED_REFRESH_EXPIRY = '30d';
const CITIZEN_REMEMBERED_REFRESH_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const STAFF_DEFAULT_REFRESH_EXPIRY = '1d';
const STAFF_DEFAULT_REFRESH_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const STAFF_REMEMBERED_REFRESH_EXPIRY = '7d';
const STAFF_REMEMBERED_REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  refreshMaxAgeMs: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  async register(dto: RegisterDto): Promise<void> {
    const user = await this.usersService.createCitizen(
      dto.name,
      dto.email,
      dto.password,
    );

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);
    await this.usersService.setVerificationToken(user.id, token, expires);
    await this.mailService.sendVerificationEmail(user.email, token);
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.usersService.findByVerificationToken(token);
    if (!user) {
      throw new BadRequestException('Invalid verification link.');
    }

    if (user.is_verified) {
      return;
    }

    if (
      !user.verification_token_expires ||
      user.verification_token_expires.getTime() < Date.now()
    ) {
      throw new BadRequestException(
        'Verification link has expired. Please register again.',
      );
    }

    await this.usersService.setVerified(user.id);
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.is_verified) {
      throw new ForbiddenException('Please verify your email first');
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

  async login(user: User, remember = false): Promise<TokenPair> {
    const tokens = await this.issueTokens(user, remember);
    await this.persistRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async refresh(
    userId: string,
    refreshToken: string,
    remember = false,
  ): Promise<TokenPair> {
    const user = await this.usersService.findById(userId);

    if (!user.refresh_token_hash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const matches = await bcrypt.compare(refreshToken, user.refresh_token_hash);
    if (!matches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.issueTokens(user, remember);
    await this.persistRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.setRefreshTokenHash(userId, null);
  }

  async updateProfile(userId: string, name: string): Promise<User> {
    return this.usersService.update(userId, { name });
  }

  async getNotificationPreferences(
    userId: string,
  ): Promise<Record<string, boolean>> {
    return this.usersService.getNotificationPreferences(userId);
  }

  async updateNotificationPreferences(
    userId: string,
    preferences: Record<string, boolean>,
  ): Promise<Record<string, boolean>> {
    return this.usersService.updateNotificationPreferences(userId, preferences);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.usersService.findById(userId);
    const matches = await bcrypt.compare(currentPassword, user.password_hash);
    if (!matches) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    await this.usersService.resetPassword(userId, newPassword);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await this.usersService.setResetToken(user.id, token, expires);
    await this.mailService.sendPasswordResetEmail(user.email, token);
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const user = await this.usersService.findByResetToken(token);
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token.');
    }

    if (
      !user.reset_token_expires ||
      user.reset_token_expires.getTime() < Date.now()
    ) {
      throw new BadRequestException('Invalid or expired reset token.');
    }

    await this.usersService.resetPassword(user.id, password);
  }

  private async issueTokens(user: User, remember = false): Promise<TokenPair> {
    const jwtConfig = this.configService.get('jwt', { infer: true });
    const payload: JwtAccessPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      department_id: user.department_id,
      remember,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: jwtConfig.accessSecret,
      expiresIn: jwtConfig.accessExpiry,
    });

    const isStaff = user.role === Role.OFFICER || user.role === Role.ADMIN;
    const refreshExpiry = isStaff
      ? remember
        ? STAFF_REMEMBERED_REFRESH_EXPIRY
        : STAFF_DEFAULT_REFRESH_EXPIRY
      : remember
        ? CITIZEN_REMEMBERED_REFRESH_EXPIRY
        : jwtConfig.refreshExpiry;
    const refreshMaxAgeMs = isStaff
      ? remember
        ? STAFF_REMEMBERED_REFRESH_MAX_AGE_MS
        : STAFF_DEFAULT_REFRESH_MAX_AGE_MS
      : remember
        ? CITIZEN_REMEMBERED_REFRESH_MAX_AGE_MS
        : CITIZEN_DEFAULT_REFRESH_MAX_AGE_MS;

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: jwtConfig.refreshSecret,
      expiresIn: refreshExpiry,
    });

    return { accessToken, refreshToken, refreshMaxAgeMs };
  }

  private async persistRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hash = await bcrypt.hash(refreshToken, REFRESH_TOKEN_HASH_ROUNDS);
    await this.usersService.setRefreshTokenHash(userId, hash);
  }
}
