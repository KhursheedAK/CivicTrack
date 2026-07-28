import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

import configuration from './config/configuration';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { User } from './users/entities/user.entity';
import { Department } from './departments/entities/department.entity';
import { Category } from './categories/entities/category.entity';
import { Complaint } from './complaints/entities/complaint.entity';
import { ComplaintAttachment } from './complaints/entities/complaint-attachment.entity';
import { ComplaintUpdate } from './complaints/entities/complaint-update.entity';
import { Notification } from './notifications/entities/notification.entity';
import { DataCorrectionRequest } from './data-corrections/entities/data-correction-request.entity';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DepartmentsModule } from './departments/departments.module';
import { CategoriesModule } from './categories/categories.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UploadModule } from './upload/upload.module';
import { MailModule } from './mail/mail.module';
import { AdminModule } from './admin/admin.module';
import { DataCorrectionsModule } from './data-corrections/data-corrections.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('database.url'),
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
        synchronize: configService.get<string>('nodeEnv') !== 'production',
      }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    AuthModule,
    UsersModule,
    DepartmentsModule,
    CategoriesModule,
    ComplaintsModule,
    NotificationsModule,
    UploadModule,
    MailModule,
    AdminModule,
    DataCorrectionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
