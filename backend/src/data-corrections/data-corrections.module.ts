import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataCorrectionRequest } from './entities/data-correction-request.entity';
import { Complaint } from '../complaints/entities/complaint.entity';
import { Category } from '../categories/entities/category.entity';
import { User } from '../users/entities/user.entity';
import { DataCorrectionsService } from './data-corrections.service';
import { DataCorrectionsController } from './data-corrections.controller';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DataCorrectionRequest, Complaint, Category, User]),
    UsersModule,
    NotificationsModule,
    MailModule,
  ],
  controllers: [DataCorrectionsController],
  providers: [DataCorrectionsService],
})
export class DataCorrectionsModule {}
