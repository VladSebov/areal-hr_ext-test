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
import { PositionsService } from './positions.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('positions')
@UseGuards(AuthenticatedGuard, RolesGuard)
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Post()
  create(@Body() createPositionDto: CreatePositionDto) {
    return this.positionsService.create(createPositionDto);
  }

  @Get()
  findAll() {
    return this.positionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.positionsService.findOne(id);
  }

  @Patch(':id')
  update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updatePositionDto: UpdatePositionDto,
  ) {
    return this.positionsService.update(id, updatePositionDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    // This calls the service's softDelete method
    return this.positionsService.remove(id);
  }
}