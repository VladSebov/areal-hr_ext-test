import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OperationsHistoryService } from './operations_history.service';
import { CreateOperationsHistoryDto } from './dto/create-operations_history.dto';
import { UpdateOperationsHistoryDto } from './dto/update-operations_history.dto';

@Controller('operations-history')
export class OperationsHistoryController {
  constructor(private readonly operationsHistoryService: OperationsHistoryService) {}

  @Post()
  create(@Body() createOperationsHistoryDto: CreateOperationsHistoryDto) {
    return this.operationsHistoryService.create(createOperationsHistoryDto);
  }

  @Get()
  findAll() {
    return this.operationsHistoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.operationsHistoryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOperationsHistoryDto: UpdateOperationsHistoryDto) {
    return this.operationsHistoryService.update(+id, updateOperationsHistoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.operationsHistoryService.remove(+id);
  }
}
