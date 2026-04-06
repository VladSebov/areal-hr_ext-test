import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OperationsHistory } from './models/operations_history.model';
import { OperationsHistoryService } from './operations_history.service';
import { OperationsHistoryController } from './operations_history.controller';
import { OperationsHistorySubscriber } from './operations_history.subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([OperationsHistory])],
  controllers: [OperationsHistoryController],
  providers: [OperationsHistoryService, OperationsHistorySubscriber],
  exports: [OperationsHistoryService],
})
export class OperationsHistoryModule {}