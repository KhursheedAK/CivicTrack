import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ComplaintStatus } from '../../common/enums/complaint-status.enum';
import { User } from '../../users/entities/user.entity';
import { Department } from '../../departments/entities/department.entity';
import { Category } from '../../categories/entities/category.entity';
import { ComplaintAttachment } from './complaint-attachment.entity';
import { ComplaintUpdate } from './complaint-update.entity';

@Entity('complaints')
export class Complaint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ name: 'tracking_code', length: 20, unique: true })
  tracking_code: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ length: 200 })
  location: string;

  @Column({ type: 'double precision', nullable: true })
  latitude: number | null;

  @Column({ type: 'double precision', nullable: true })
  longitude: number | null;

  @Column({
    type: 'enum',
    enum: ComplaintStatus,
    default: ComplaintStatus.SUBMITTED,
  })
  status: ComplaintStatus;

  @Column({ name: 'citizen_id', type: 'uuid' })
  citizen_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'citizen_id' })
  citizen: User;

  @Column({ name: 'department_id', type: 'uuid' })
  department_id: string;

  @ManyToOne(() => Department, (department) => department.complaints)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column({ name: 'category_id', type: 'uuid' })
  category_id: string;

  @ManyToOne(() => Category, (category) => category.complaints)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'assigned_officer_id', type: 'uuid', nullable: true })
  assigned_officer_id: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_officer_id' })
  assigned_officer: User | null;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolved_at: Date | null;

  /** True while a reassignment request is pending admin review */
  @Column({ name: 'reassignment_requested', type: 'boolean', default: false })
  reassignment_requested: boolean;

  /** The reason the officer stated when requesting reassignment */
  @Column({ name: 'reassignment_reason', type: 'text', nullable: true })
  reassignment_reason: string | null;

  /** True once an admin has rejected a reassignment request — blocks further requests */
  @Column({ name: 'reassignment_rejected', type: 'boolean', default: false })
  reassignment_rejected: boolean;

  @OneToMany(() => ComplaintAttachment, (attachment) => attachment.complaint, {
    cascade: true,
  })
  attachments: ComplaintAttachment[];

  @OneToMany(() => ComplaintUpdate, (update) => update.complaint, {
    cascade: true,
  })
  updates: ComplaintUpdate[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date;
}
