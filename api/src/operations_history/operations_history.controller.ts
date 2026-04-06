import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { OperationsHistoryService } from './operations_history.service';

@Controller('operations-history')
export class OperationsHistoryController {
  constructor(private readonly historyService: OperationsHistoryService) {}

  @Get()
  findAll(
      @Query('entityName') entityName: string,
      @Query('entityId') entityId: number,
  ) {
    return this.historyService.findAll(entityName, entityId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.historyService.findOne(id);
  }
}