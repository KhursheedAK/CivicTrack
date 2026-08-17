import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { AssignOfficerDto } from './dto/assign-officer.dto';
import { RequestReassignmentDto } from './dto/request-reassignment.dto';
import { ListComplaintsQueryDto } from './dto/list-complaints-query.dto';
import { CreateComplaintResponseDto } from './dto/create-complaint-response.dto';
import {
  ComplaintSummaryDto,
  PaginatedComplaintsDto,
} from './dto/complaint-summary.dto';
import { ComplaintDetailDto } from './dto/complaint-detail.dto';
import { PublicComplaintDto } from './dto/public-complaint.dto';

@ApiTags('complaints')
@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CITIZEN)
  @ApiOperation({ summary: 'Submit a new complaint (Citizen only)' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateComplaintDto,
  ): Promise<CreateComplaintResponseDto> {
    return this.complaintsService.create(user.id, dto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OFFICER, Role.ADMIN)
  @ApiOperation({ summary: 'List complaints with filters (Officer/Admin)' })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListComplaintsQueryDto,
  ): Promise<PaginatedComplaintsDto> {
    return this.complaintsService.findAll(user, query);
  }

  @Get('my')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CITIZEN)
  @ApiOperation({ summary: "List the current citizen's complaints" })
  findMine(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListComplaintsQueryDto,
  ): Promise<PaginatedComplaintsDto> {
    return this.complaintsService.findMine(user.id, query);
  }

  @Get('track/:code')
  @ApiOperation({ summary: 'Track a complaint by its tracking code (public)' })
  trackByCode(@Param('code') code: string): Promise<PublicComplaintDto> {
    return this.complaintsService.findByTrackingCode(code);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a single complaint by id' })
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ComplaintDetailDto> {
    return this.complaintsService.findById(id, user);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CITIZEN, Role.OFFICER, Role.ADMIN)
  @ApiOperation({ summary: 'Update complaint status' })
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStatusDto,
  ): Promise<ComplaintDetailDto> {
    return this.complaintsService.updateStatus(id, dto, user);
  }

  @Post(':id/comments')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CITIZEN, Role.OFFICER, Role.ADMIN)
  @ApiOperation({ summary: 'Add a comment to a complaint' })
  addComment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddCommentDto,
  ): Promise<ComplaintDetailDto> {
    return this.complaintsService.addComment(id, dto, user);
  }

  @Patch(':id/assign')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Assign or unassign an officer (Admin only)' })
  assign(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignOfficerDto,
  ): Promise<ComplaintSummaryDto> {
    return this.complaintsService.assign(id, dto, user);
  }

  @Post(':id/request-reassignment')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OFFICER)
  @ApiOperation({ summary: 'Officer submits a reassignment request (reason only). Admin must approve or reject.' })
  requestReassignment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RequestReassignmentDto,
  ): Promise<ComplaintDetailDto> {
    return this.complaintsService.requestReassignment(id, dto, user);
  }

  @Patch(':id/reject-reassignment')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin rejects a pending reassignment request (blocks future requests)' })
  rejectReassignment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ComplaintDetailDto> {
    return this.complaintsService.rejectReassignment(id, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a complaint (Admin only)' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.complaintsService.remove(id);
  }
}
