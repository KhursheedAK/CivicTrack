import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsNotEmptyObject } from 'class-validator';

export class UpdateNotificationPreferencesDto {
  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'boolean' },
    example: { 'daily-summary': true, 'urgent-cases': false },
  })
  @IsNotEmptyObject()
  @IsObject()
  preferences: Record<string, boolean>;
}
