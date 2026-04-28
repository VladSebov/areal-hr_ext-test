import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards
} from '@nestjs/common';
import { PassportScansService } from './passport_scans.service';
import { CreatePassportScanDto } from './dto/create-passport_scan.dto';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('passport-scans')
@UseGuards(AuthenticatedGuard, RolesGuard)
export class PassportScansController {
  constructor(private readonly scansService: PassportScansService) {}

  @Post()
  create(@Body() createDto: CreatePassportScanDto) {
    return this.scansService.create(createDto);
  }

  @Get()
  findAll() {
    return this.scansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.scansService.findOne(id);
  }

  @Get('employee/:employeeId')
  findByEmployee(@Param('employeeId', ParseIntPipe) employeeId: number) {
    return this.scansService.findByEmployee(employeeId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.scansService.remove(id);
  }
}