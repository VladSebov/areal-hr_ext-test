import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { PassportScansService } from './passport_scans.service';
import { CreatePassportScanDto } from './dto/create-passport_scan.dto';

@Controller('passport-scans')
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