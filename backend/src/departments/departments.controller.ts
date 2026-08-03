import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentResponseDto } from './dto/department-response.dto';

@ApiTags('departments')
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List all active departments' })
  findAll(): Promise<DepartmentResponseDto[]> {
    return this.departmentsService.findAllActive();
  }

  @Get('all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List all departments, including inactive ones (Admin only)' })
  findAllForAdmin(): Promise<DepartmentResponseDto[]> {
    return this.departmentsService.findAllForAdmin();
  }

  @Get(':id/officers')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OFFICER)
  @ApiOperation({ summary: 'List officers in a department (Admin and Officer)' })
  findOfficers(@Param('id', ParseUUIDPipe) id: string) {
    return this.departmentsService.findOfficersByDepartment(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a department (Admin only)' })
  create(@Body() dto: CreateDepartmentDto): Promise<DepartmentResponseDto> {
    return this.departmentsService.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a department (Admin only)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    return this.departmentsService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Deactivate a department (Admin only)' })
  deactivate(@Param('id', ParseUUIDPipe) id: string): Promise<DepartmentResponseDto> {
    return this.departmentsService.deactivate(id);
  }

  @Patch(':id/reactivate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Reactivate a department (Admin only)' })
  reactivate(@Param('id', ParseUUIDPipe) id: string): Promise<DepartmentResponseDto> {
    return this.departmentsService.reactivate(id);
  }
}
