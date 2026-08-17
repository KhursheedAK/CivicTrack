import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NotificationType } from '../../common/enums/notification-type.enum';
import { User } from '../../users/entities/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 500 })
  message: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ name: 'reference_id', type: 'uuid', nullable: true })
  reference_id: string | null;

  @Column({ name: 'is_read', default: false })
  is_read: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;
}
