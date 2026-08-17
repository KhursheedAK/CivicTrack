import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Complaint } from './complaint.entity';

@Entity('complaint_attachments')
export class ComplaintAttachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'complaint_id', type: 'uuid' })
  complaint_id: string;

  @ManyToOne(() => Complaint, (complaint) => complaint.attachments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'complaint_id' })
  complaint: Complaint;

  @Column({ name: 'file_url', length: 500 })
  file_url: string;

  @Column({ name: 'file_name', length: 255 })
  file_name: string;

  @Column({ name: 'mime_type', length: 100 })
  mime_type: string;

  @Column({ name: 'cloudinary_public_id', length: 255 })
  cloudinary_public_id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;
}
