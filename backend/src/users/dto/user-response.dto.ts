import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';

export class UserResponseDto {
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

  @ApiProperty()
  is_blocked: boolean;

  @ApiProperty()
  created_at: Date;
}
