import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID, ValidateIf } from 'class-validator';

export class AssignOfficerDto {
  @ApiProperty({ nullable: true, description: 'null to unassign' })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  officer_id: string | null;
}
