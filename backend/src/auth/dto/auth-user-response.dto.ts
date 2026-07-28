import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';

export class AuthUserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: Role })
  role: Role;

  @ApiProperty({ nullable: true })
  department_id: string | null;

  @ApiProperty()
  is_verified: boolean;
}

export class LoginResponseDto {
  @ApiProperty({ type: AuthUserResponseDto })
  user: AuthUserResponseDto;
}

export class MeResponseDto extends AuthUserResponseDto {
  @ApiProperty()
  created_at: Date;
}

export class MessageResponseDto {
  @ApiProperty()
  message: string;
}

export class NotificationPreferencesResponseDto {
  @ApiProperty({ type: 'object', additionalProperties: { type: 'boolean' } })
  preferences: Record<string, boolean>;
}
