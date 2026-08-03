import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../common/enums/role.enum';
import { ComplaintStatus } from '../common/enums/complaint-status.enum';
import { Department } from './entities/department.entity';
import { Category } from '../categories/entities/category.entity';
import { User } from '../users/entities/user.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentResponseDto } from './dto/department-response.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentsRepository: Repository<Department>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findOfficersByDepartment(departmentId: string): Promise<{ id: string; name: string }[]> {
    const officers = await this.usersRepository.find({
      where: { department_id: departmentId, role: Role.OFFICER },
      select: { id: true, name: true },
      order: { name: 'ASC' },
    });
    return officers.map((o) => ({ id: o.id, name: o.name }));
  }

  async findAllActive(): Promise<DepartmentResponseDto[]> {
    return this.queryDepartments({ activeOnly: true });
  }

  /** Admin management view — includes deactivated departments, since the
   * public listing (used for e.g. the citizen complaint form) can't show
   * them or there'd be no way to see/reactivate one again. */
  async findAllForAdmin(): Promise<DepartmentResponseDto[]> {
    return this.queryDepartments({ activeOnly: false });
  }

  private async queryDepartments({
    activeOnly,
  }: {
    activeOnly: boolean;
  }): Promise<DepartmentResponseDto[]> {
    const qb = this.departmentsRepository
      .createQueryBuilder('d')
      .select('d.id', 'id')
      .addSelect('d.name', 'name')
      .addSelect('d.description', 'description')
      .addSelect('d.is_active', 'is_active')
      .addSelect('d.created_at', 'created_at')
      .addSelect(
        (sub) =>
          sub
            .select('COUNT(*)', 'cnt')
            .from('categories', 'c')
            .where('c.department_id = d.id')
            .andWhere(activeOnly ? 'c.is_active = true' : '1=1'),
        'category_count',
      )
      .addSelect(
        (sub) =>
          sub
            .select('COUNT(*)', 'cnt')
            .from('users', 'u')
            .where('u.department_id = d.id')
            .andWhere(`u.role = '${Role.OFFICER}'`)
            .andWhere('u.deleted_at IS NULL'),
        'officer_count',
      )
      .addSelect(
        (sub) =>
          sub
            .select('COUNT(*)', 'cnt')
            .from('complaints', 'co')
            .where('co.department_id = d.id')
            .andWhere(
              `co.status NOT IN ('${ComplaintStatus.RESOLVED}', '${ComplaintStatus.CLOSED}', '${ComplaintStatus.REJECTED}')`,
            ),
        'open_complaint_count',
      )
      .orderBy('d.name', 'ASC');

    if (activeOnly) {
      qb.where('d.is_active = true');
    }

    const rows = await qb.getRawMany<{
      id: string;
      name: string;
      description: string | null;
      is_active: boolean;
      created_at: Date;
      category_count: string;
      officer_count: string;
      open_complaint_count: string;
    }>();

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      is_active: r.is_active,
      category_count: parseInt(r.category_count, 10) || 0,
      officer_count: parseInt(r.officer_count, 10) || 0,
      open_complaint_count: parseInt(r.open_complaint_count, 10) || 0,
      created_at: r.created_at,
    }));
  }

  async findById(id: string): Promise<Department> {
    const department = await this.departmentsRepository.findOne({
      where: { id },
    });
    if (!department) {
      throw new NotFoundException('Department not found');
    }
    return department;
  }

  async create(dto: CreateDepartmentDto): Promise<DepartmentResponseDto> {
    const department = this.departmentsRepository.create({
      name: dto.name,
      description: dto.description ?? null,
    });
    const saved = await this.departmentsRepository.save(department);
    return {
      id: saved.id,
      name: saved.name,
      description: saved.description,
      is_active: saved.is_active,
      category_count: 0,
      officer_count: 0,
      open_complaint_count: 0,
      created_at: saved.created_at,
    };
  }

  async update(id: string, dto: UpdateDepartmentDto): Promise<DepartmentResponseDto> {
    const department = await this.findById(id);
    Object.assign(department, dto);
    const saved = await this.departmentsRepository.save(department);
    return {
      id: saved.id,
      name: saved.name,
      description: saved.description,
      is_active: saved.is_active,
      category_count: 0,
      officer_count: 0,
      open_complaint_count: 0,
      created_at: saved.created_at,
    };
  }

  async deactivate(id: string): Promise<DepartmentResponseDto> {
    const department = await this.findById(id);
    department.is_active = false;
    const saved = await this.departmentsRepository.save(department);

    // Only cascade to categories that are *currently* active — a category an
    // admin had already deactivated independently is left alone, and is not
    // marked as "deactivated by the department" so reactivating won't revive it.
    await this.categoriesRepository
      .createQueryBuilder()
      .update(Category)
      .set({ is_active: false, deactivated_by_department: true })
      .where('department_id = :id', { id })
      .andWhere('is_active = true')
      .execute();

    return {
      id: saved.id,
      name: saved.name,
      description: saved.description,
      is_active: saved.is_active,
      category_count: 0,
      officer_count: 0,
      open_complaint_count: 0,
      created_at: saved.created_at,
    };
  }

  async reactivate(id: string): Promise<DepartmentResponseDto> {
    const department = await this.findById(id);
    department.is_active = true;
    const saved = await this.departmentsRepository.save(department);

    // Only restore categories that became inactive *as a side effect of this
    // department's deactivation* — one that was already inactive beforehand
    // (deactivated_by_department = false) stays inactive.
    await this.categoriesRepository
      .createQueryBuilder()
      .update(Category)
      .set({ is_active: true, deactivated_by_department: false })
      .where('department_id = :id', { id })
      .andWhere('deactivated_by_department = true')
      .execute();

    return {
      id: saved.id,
      name: saved.name,
      description: saved.description,
      is_active: saved.is_active,
      category_count: 0,
      officer_count: 0,
      open_complaint_count: 0,
      created_at: saved.created_at,
    };
  }
}
