import { Module } from '@nestjs/common';
import { HrOperationsService } from './hr_operations.service';
import { HrOperationsController } from './hr_operations.controller';

@Module({
  controllers: [HrOperationsController],
  providers: [HrOperationsService],
})
export class HrOperationsModule {}
