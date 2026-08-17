import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { Role } from '../common/enums/role.enum';
import { DataCorrectionStatus } from '../common/enums/data-correction.enum';
import { DataCorrectionsService } from './data-corrections.service';
import { CreateDataCorrectionRequestDto } from './dto/create-data-correction-request.dto';
import { ApproveDataCorrectionRequestDto } from './dto/approve-data-correction-request.dto';
import { RejectDataCorrectionRequestDto } from './dto/reject-data-correction-request.dto';
import {
  DataCorrectionRequestDto,
  DataCorrectionRequestListDto,
} from './dto/data-correction-request-response.dto';

@ApiTags('data-corrections')
@ApiBearerAuth()
@Controller('data-corrections')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DataCorrectionsController {
  constructor(private readonly service: DataCorrectionsService) {}

  @Post()
  @Roles(Role.OFFICER)
  @ApiOperation({ summary: 'Submit a data correction request (Officer only)' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateDataCorrectionRequestDto,
  ): Promise<DataCorrectionRequestDto> {
    return this.service.create(user, dto);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List all data correction requests (Admin only)' })
  findAll(@Query('status') status?: DataCorrectionStatus): Promise<DataCorrectionRequestListDto> {
    return this.service.findAll(status);
  }

  @Get('my')
  @Roles(Role.OFFICER)
  @ApiOperation({ summary: "List the current officer's own requests" })
  findMine(@CurrentUser() user: AuthenticatedUser): Promise<DataCorrectionRequestListDto> {
    return this.service.findMine(user.id);
  }

  @Get(':id')
  @Roles(Role.OFFICER, Role.ADMIN)
  @ApiOperation({ summary: 'Get a single data correction request' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DataCorrectionRequestDto> {
    return this.service.findOne(id, user);
  }

  @Patch(':id/approve')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Approve a data correction request and apply the change (Admin only)' })
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ApproveDataCorrectionRequestDto,
  ): Promise<DataCorrectionRequestDto> {
    return this.service.approve(id, user, dto);
  }

  @Patch(':id/reject')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Reject a data correction request (Admin only)' })
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RejectDataCorrectionRequestDto,
  ): Promise<DataCorrectionRequestDto> {
    return this.service.reject(id, user, dto);
  }
}
