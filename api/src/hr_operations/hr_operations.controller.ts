import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { HrOperationsService } from './hr_operations.service';
import { CreateHrOperationDto } from './dto/create-hr_operation.dto';
import { UpdateHrOperationDto } from './dto/update-hr_operation.dto';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('hr-operations')
@UseGuards(AuthenticatedGuard, RolesGuard)
export class HrOperationsController {
  constructor(private readonly hrOperationsService: HrOperationsService) {}

  @Post()
  create(@Body() createDto: CreateHrOperationDto) {
    return this.hrOperationsService.create(createDto);
  }

  @Get()
  findAll() {
    return this.hrOperationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.hrOperationsService.findOne(id);
  }


  @Patch(':id')
  update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateDto: UpdateHrOperationDto,
  ) {
    return this.hrOperationsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.hrOperationsService.remove(id);
  }
}