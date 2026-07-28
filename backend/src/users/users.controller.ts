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
import { Role } from '../common/enums/role.enum';
import { MailService } from '../mail/mail.service';
import { UsersService } from './users.service';
import { CreateOfficerDto } from './dto/create-officer.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { PaginatedUsersDto } from './dto/paginated-users.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all users (Admin only)' })
  findAll(@Query() query: ListUsersQueryDto): Promise<PaginatedUsersDto> {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.OFFICER)
  @ApiOperation({ summary: 'Get a user by ID (Admin and Officer)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findByIdWithDepartment(id);
  }

  @Post('officers')
  @ApiOperation({ summary: 'Create an officer account (Admin only)' })
  async createOfficer(@Body() dto: CreateOfficerDto): Promise<UserResponseDto> {
    const officer = await this.usersService.createOfficer(dto);
    await this.mailService.sendOfficerWelcomeEmail(
      officer.email,
      officer.name,
      dto.password,
    );
    return this.toResponseDto(officer);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user (Admin only)' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.update(id, dto);
    return this.toResponseDto(user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a user (Admin only)' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.usersService.softDelete(id);
  }

  private toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department_id: user.department_id,
      is_verified: user.is_verified,
      is_blocked: user.is_blocked,
      created_at: user.created_at,
    };
  }
}
