import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../common/enums/role.enum';
import { Department } from '../../departments/entities/department.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Index({ unique: true })
  @Column({ length: 255, unique: true })
  email: string;

  @Exclude()
  @Column({ name: 'password_hash', length: 255 })
  password_hash: string;

  @Column({ type: 'enum', enum: Role, default: Role.CITIZEN })
  role: Role;

  @Column({ name: 'is_verified', default: false })
  is_verified: boolean;

  @Column({ name: 'is_blocked', default: false })
  is_blocked: boolean;

  @Exclude()
  @Column({ name: 'verification_token', type: 'varchar', length: 255, nullable: true })
  verification_token: string | null;

  @Exclude()
  @Column({ name: 'verification_token_expires', type: 'timestamptz', nullable: true })
  verification_token_expires: Date | null;

  @Exclude()
  @Column({ name: 'reset_token', type: 'varchar', length: 255, nullable: true })
  reset_token: string | null;

  @Exclude()
  @Column({ name: 'reset_token_expires', type: 'timestamptz', nullable: true })
  reset_token_expires: Date | null;

  @Exclude()
  @Column({ name: 'refresh_token_hash', type: 'varchar', length: 255, nullable: true })
  refresh_token_hash: string | null;

  @Column({ name: 'department_id', type: 'uuid', nullable: true })
  department_id: string | null;

  @Column({ name: 'notification_preferences', type: 'jsonb', default: {} })
  notification_preferences: Record<string, boolean>;

  @ManyToOne(() => Department, (department) => department.users, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'department_id' })
  department: Department | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date;

  @Exclude()
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deleted_at: Date | null;
}
