import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AppConfig } from '../config/configuration';
import { clearAuthCookies, setAuthCookies } from '../common/helpers/cookie.helper';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailQueryDto } from './dto/verify-email.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';
import {
  LoginResponseDto,
  MeResponseDto,
  MessageResponseDto,
  NotificationPreferencesResponseDto,
} from './dto/auth-user-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthenticatedUser } from './strategies/jwt.strategy';
import type { AuthenticatedRefreshUser } from './strategies/jwt-refresh.strategy';
import { UsersService } from '../users/users.service';

const AUTH_THROTTLE = { default: { limit: 10, ttl: 60000 } };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly isProduction: boolean;

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    configService: ConfigService<AppConfig, true>,
  ) {
    this.isProduction =
      configService.get('nodeEnv', { infer: true }) === 'production';
  }

  @Post('register')
  @Throttle(AUTH_THROTTLE)
  @ApiOperation({ summary: 'Register a new citizen account' })
  async register(@Body() dto: RegisterDto): Promise<MessageResponseDto> {
    await this.authService.register(dto);
    return { message: 'Registration successful. Please verify your email.' };
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verify a citizen email address' })
  async verifyEmail(
    @Query() query: VerifyEmailQueryDto,
  ): Promise<MessageResponseDto> {
    await this.authService.verifyEmail(query.token);
    return { message: 'Email verified successfully.' };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle(AUTH_THROTTLE)
  @ApiOperation({ summary: 'Login and receive auth cookies' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    const user = await this.authService.validateUser(dto.email, dto.password);
    const tokens = await this.authService.login(user, dto.remember);
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken, this.isProduction, tokens.refreshMaxAgeMs);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department_id: user.department_id,
        is_verified: user.is_verified,
      },
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout and clear auth cookies' })
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<MessageResponseDto> {
    await this.authService.logout(user.id);
    clearAuthCookies(res, this.isProduction);
    return { message: 'Logged out' };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({ summary: 'Rotate access and refresh tokens' })
  async refresh(
    @CurrentUser() user: AuthenticatedRefreshUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<MessageResponseDto> {
    const tokens = await this.authService.refresh(user.sub, user.refreshToken, user.remember);
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken, this.isProduction, tokens.refreshMaxAgeMs);
    return { message: 'Token refreshed' };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle(AUTH_THROTTLE)
  @ApiOperation({ summary: 'Request a password reset email' })
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<MessageResponseDto> {
    await this.authService.forgotPassword(dto.email);
    return { message: 'If that email exists, a reset link has been sent.' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle(AUTH_THROTTLE)
  @ApiOperation({ summary: 'Reset password using a reset token' })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<MessageResponseDto> {
    await this.authService.resetPassword(dto.token, dto.password);
    return { message: 'Password reset successful.' };
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  async me(@CurrentUser() user: AuthenticatedUser): Promise<MeResponseDto> {
    const fullUser = await this.usersService.findById(user.id);
    return {
      id: fullUser.id,
      name: fullUser.name,
      email: fullUser.email,
      role: fullUser.role,
      department_id: fullUser.department_id,
      is_verified: fullUser.is_verified,
      created_at: fullUser.created_at,
    };
  }

  @Patch('profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update own profile (any authenticated user)' })
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<MeResponseDto> {
    const updated = await this.authService.updateProfile(user.id, dto.name);
    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      department_id: updated.department_id,
      is_verified: updated.is_verified,
      created_at: updated.created_at,
    };
  }

  @Patch('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Change own password (any authenticated user)' })
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ): Promise<MessageResponseDto> {
    await this.authService.changePassword(
      user.id,
      dto.current_password,
      dto.new_password,
    );
    return { message: 'Password changed successfully.' };
  }

  @Get('notification-preferences')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get own notification preferences' })
  async getNotificationPreferences(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<NotificationPreferencesResponseDto> {
    const preferences = await this.authService.getNotificationPreferences(user.id);
    return { preferences };
  }

  @Patch('notification-preferences')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update own notification preferences' })
  async updateNotificationPreferences(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreferencesResponseDto> {
    const preferences = await this.authService.updateNotificationPreferences(
      user.id,
      dto.preferences,
    );
    return { preferences };
  }
}
