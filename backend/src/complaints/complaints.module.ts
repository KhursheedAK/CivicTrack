import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Complaint } from './entities/complaint.entity';
import { ComplaintAttachment } from './entities/complaint-attachment.entity';
import { ComplaintUpdate } from './entities/complaint-update.entity';
import { Category } from '../categories/entities/category.entity';
import { User } from '../users/entities/user.entity';
import { ComplaintsService } from './complaints.service';
import { ComplaintsController } from './complaints.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { MailModule } from '../mail/mail.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Complaint,
      ComplaintAttachment,
      ComplaintUpdate,
      Category,
      User,
    ]),
    NotificationsModule,
    MailModule,
    UploadModule,
  ],
  controllers: [ComplaintsController],
  providers: [ComplaintsService],
  exports: [ComplaintsService],
})
export class ComplaintsModule {}
