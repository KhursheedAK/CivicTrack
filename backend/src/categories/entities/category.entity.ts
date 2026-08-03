import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Department } from '../../departments/entities/department.entity';
import { Complaint } from '../../complaints/entities/complaint.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ name: 'department_id', type: 'uuid' })
  department_id: string;

  @ManyToOne(() => Department, (department) => department.categories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column({ name: 'is_active', default: true })
  is_active: boolean;

  // True only while this category is inactive *because* its department was
  // deactivated (not because an admin independently deactivated it). Lets
  // reactivating the department restore exactly the categories it turned off,
  // without reviving ones an admin had already deactivated on their own.
  @Column({ name: 'deactivated_by_department', default: false })
  deactivated_by_department: boolean;

  @OneToMany(() => Complaint, (complaint) => complaint.category)
  complaints: Complaint[];
}
