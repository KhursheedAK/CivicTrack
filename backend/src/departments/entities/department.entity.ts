import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { Complaint } from '../../complaints/entities/complaint.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string | null;

  @Column({ name: 'is_active', default: true })
  is_active: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @OneToMany(() => User, (user) => user.department)
  users: User[];

  @OneToMany(() => Category, (category) => category.department)
  categories: Category[];

  @OneToMany(() => Complaint, (complaint) => complaint.department)
  complaints: Complaint[];
}
