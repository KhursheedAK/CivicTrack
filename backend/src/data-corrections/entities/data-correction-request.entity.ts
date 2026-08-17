import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  DataCorrectionStatus,
  DataCorrectionTargetType,
} from '../../common/enums/data-correction.enum';
import { User } from '../../users/entities/user.entity';
import { Complaint } from '../../complaints/entities/complaint.entity';

@Entity('data_correction_requests')
export class DataCorrectionRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'requested_by_id', type: 'uuid' })
  requested_by_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requested_by_id' })
  requested_by: User;

  @Column({
    name: 'target_type',
    type: 'enum',
    enum: DataCorrectionTargetType,
  })
  target_type: DataCorrectionTargetType;

  @Column({ name: 'complaint_id', type: 'uuid', nullable: true })
  complaint_id: string | null;

  @ManyToOne(() => Complaint, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'complaint_id' })
  complaint: Complaint | null;

  @Column({ name: 'fields_flagged', type: 'jsonb' })
  fields_flagged: string[];

  @Column({ name: 'current_data', type: 'text' })
  current_data: string;

  @Column({ name: 'requested_correction', type: 'text' })
  requested_correction: string;

  @Column({
    type: 'enum',
    enum: DataCorrectionStatus,
    default: DataCorrectionStatus.PENDING,
  })
  status: DataCorrectionStatus;

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  admin_notes: string | null;

  @Column({ name: 'resolved_by_id', type: 'uuid', nullable: true })
  resolved_by_id: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'resolved_by_id' })
  resolved_by: User | null;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolved_at: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;
}
