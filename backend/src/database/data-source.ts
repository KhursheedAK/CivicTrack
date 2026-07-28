import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Department } from '../departments/entities/department.entity';
import { Category } from '../categories/entities/category.entity';
import { Complaint } from '../complaints/entities/complaint.entity';
import { ComplaintAttachment } from '../complaints/entities/complaint-attachment.entity';
import { ComplaintUpdate } from '../complaints/entities/complaint-update.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { DataCorrectionRequest } from '../data-corrections/entities/data-correction-request.entity';

config();

// Used by the TypeORM CLI (migration:generate/run/revert) and by the seed script.
// Always synchronize: false — schema changes must go through a committed migration
// file, never an implicit auto-sync, so every environment (including a fresh
// production database) ends up with an identical, reproducible schema.
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [
    User,
    Department,
    Category,
    Complaint,
    ComplaintAttachment,
    ComplaintUpdate,
    Notification,
    DataCorrectionRequest,
  ],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
});
