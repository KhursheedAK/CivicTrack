import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Complaint } from '../complaints/entities/complaint.entity';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Complaint])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AdminModule {}
