import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async findAll(departmentId?: string): Promise<CategoryResponseDto[]> {
    const query = this.categoriesRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.department', 'department')
      .orderBy('category.name', 'ASC');

    if (departmentId) {
      query.where('category.department_id = :departmentId', {
        departmentId,
      });
    }

    const categories = await query.getMany();
    return categories.map((category) => this.toResponseDto(category));
  }

  async findById(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: { department: true },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async create(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const category = this.categoriesRepository.create({
      name: dto.name,
      department_id: dto.department_id,
    });
    const saved = await this.categoriesRepository.save(category);
    return this.toResponseDto(await this.findById(saved.id));
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    const category = await this.findById(id);
    Object.assign(category, dto);
    // An explicit admin choice on this category's active state overrides
    // whatever the last department deactivate/reactivate cascade left behind —
    // otherwise a manually-reactivated category could get silently deactivated
    // again the next time someone reactivates its department.
    if (dto.is_active !== undefined) {
      category.deactivated_by_department = false;
    }
    const saved = await this.categoriesRepository.save(category);
    return this.toResponseDto(await this.findById(saved.id));
  }

  private toResponseDto(category: Category): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      department_id: category.department_id,
      department_name: category.department?.name ?? '',
      is_active: category.is_active,
    };
  }
}
