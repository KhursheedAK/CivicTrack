import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { Role } from '../common/enums/role.enum';
import { NOTIFICATION_PREFERENCE_KEYS } from '../common/constants/notification-preference-keys';
import { User } from './entities/user.entity';
import { CreateOfficerDto } from './dto/create-officer.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { PaginatedUsersDto } from './dto/paginated-users.dto';
import { UserListItemDto } from './dto/user-list-item.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async createCitizen(
    name: string,
    email: string,
    password: string,
  ): Promise<User> {
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = this.usersRepository.create({
      name,
      email,
      password_hash,
      role: Role.CITIZEN,
      is_verified: false,
    });
    return this.usersRepository.save(user);
  }

  async createOfficer(dto: CreateOfficerDto): Promise<User> {
    const existing = await this.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const password_hash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = this.usersRepository.create({
      name: dto.name,
      email: dto.email,
      password_hash,
      role: Role.OFFICER,
      is_verified: true,
      department_id: dto.department_id,
    });
    return this.usersRepository.save(user);
  }

  async findByIdWithDepartment(id: string): Promise<UserListItemDto> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.department', 'department')
      .where('user.id = :id', { id })
      .getOne();
    if (!user) throw new NotFoundException('User not found');
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department_id: user.department_id,
      department_name: user.department?.name ?? null,
      is_verified: user.is_verified,
      is_blocked: user.is_blocked,
      created_at: user.created_at,
    };
  }

  async findAll(query: ListUsersQueryDto): Promise<PaginatedUsersDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.department', 'department')
      .orderBy('user.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.role) {
      qb.andWhere('user.role = :role', { role: query.role });
    }

    if (query.department_id) {
      qb.andWhere('user.department_id = :departmentId', { departmentId: query.department_id });
    }

    if (query.search) {
      qb.andWhere(
        '(LOWER(user.name) LIKE :search OR LOWER(user.email) LIKE :search)',
        { search: `%${query.search.toLowerCase()}%` },
      );
    }

    const [users, total] = await qb.getManyAndCount();

    const items: UserListItemDto[] = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department_id: user.department_id,
      department_name: user.department?.name ?? null,
      is_verified: user.is_verified,
      is_blocked: user.is_blocked,
      created_at: user.created_at,
    }));

    return { items, total, page, limit };
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (dto.name !== undefined) {
      user.name = dto.name;
    }
    if (dto.department_id !== undefined) {
      user.department_id = dto.department_id;
    }
    if (dto.is_blocked !== undefined) {
      user.is_blocked = dto.is_blocked;
    }
    return this.usersRepository.save(user);
  }

  async softDelete(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.usersRepository.softRemove(user);
  }

  async setVerified(id: string): Promise<void> {
    await this.usersRepository.update(id, {
      is_verified: true,
      verification_token: null,
      verification_token_expires: null,
    });
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { verification_token: token },
    });
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { reset_token: token } });
  }

  async setVerificationToken(
    id: string,
    token: string,
    expires: Date,
  ): Promise<void> {
    await this.usersRepository.update(id, {
      verification_token: token,
      verification_token_expires: expires,
    });
  }

  async setResetToken(id: string, token: string, expires: Date): Promise<void> {
    await this.usersRepository.update(id, {
      reset_token: token,
      reset_token_expires: expires,
    });
  }

  async resetPassword(id: string, password: string): Promise<void> {
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    await this.usersRepository.update(id, {
      password_hash,
      reset_token: null,
      reset_token_expires: null,
      refresh_token_hash: null,
    });
  }

  async setRefreshTokenHash(id: string, hash: string | null): Promise<void> {
    await this.usersRepository.update(id, { refresh_token_hash: hash });
  }

  async save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  async getNotificationPreferences(id: string): Promise<Record<string, boolean>> {
    const user = await this.findById(id);
    return user.notification_preferences ?? {};
  }

  async updateNotificationPreferences(
    id: string,
    preferences: Record<string, boolean>,
  ): Promise<Record<string, boolean>> {
    for (const [key, value] of Object.entries(preferences)) {
      if (!(NOTIFICATION_PREFERENCE_KEYS as readonly string[]).includes(key)) {
        throw new BadRequestException(`Unknown notification preference: ${key}`);
      }
      if (typeof value !== 'boolean') {
        throw new BadRequestException(`Preference "${key}" must be a boolean`);
      }
    }

    const user = await this.findById(id);
    user.notification_preferences = {
      ...(user.notification_preferences ?? {}),
      ...preferences,
    };
    await this.usersRepository.update(id, {
      notification_preferences: user.notification_preferences,
    });
    return user.notification_preferences;
  }
}
