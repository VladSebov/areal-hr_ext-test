import { Module } from '@nestjs/common';
import { OperationsHistoryService } from './operations_history.service';
import { OperationsHistoryController } from './operations_history.controller';

@Module({
  controllers: [OperationsHistoryController],
  providers: [OperationsHistoryService],
})
export class OperationsHistoryModule {}
