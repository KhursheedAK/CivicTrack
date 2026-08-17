import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ComplaintStatus } from '../../common/enums/complaint-status.enum';
import { Complaint } from './complaint.entity';
import { User } from '../../users/entities/user.entity';

@Entity('complaint_updates')
export class ComplaintUpdate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'complaint_id', type: 'uuid' })
  complaint_id: string;

  @ManyToOne(() => Complaint, (complaint) => complaint.updates, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'complaint_id' })
  complaint: Complaint;

  @Column({ name: 'author_id', type: 'uuid' })
  author_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column({ type: 'text' })
  comment: string;

  @Column({
    name: 'status_changed_to',
    type: 'enum',
    enum: ComplaintStatus,
    nullable: true,
  })
  status_changed_to: ComplaintStatus | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;
}
