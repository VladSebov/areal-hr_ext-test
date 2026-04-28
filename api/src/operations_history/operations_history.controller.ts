import { Controller, Get, Query, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { OperationsHistoryService } from './operations_history.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('operations-history')
@UseGuards(AuthenticatedGuard, RolesGuard)
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