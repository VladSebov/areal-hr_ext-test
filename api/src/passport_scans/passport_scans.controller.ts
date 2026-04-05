import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PassportScansService } from './passport_scans.service';
import { CreatePassportScanDto } from './dto/create-passport_scan.dto';
import { UpdatePassportScanDto } from './dto/update-passport_scan.dto';

@Controller('passport-scans')
export class PassportScansController {
  constructor(private readonly passportScansService: PassportScansService) {}

  @Post()
  create(@Body() createPassportScanDto: CreatePassportScanDto) {
    return this.passportScansService.create(createPassportScanDto);
  }

  @Get()
  findAll() {
    return this.passportScansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.passportScansService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePassportScanDto: UpdatePassportScanDto) {
    return this.passportScansService.update(+id, updatePassportScanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.passportScansService.remove(+id);
  }
}
