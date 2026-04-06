import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportScansService } from './passport_scans.service';
import { PassportScansController } from './passport_scans.controller';
import { PassportScan } from './models/passport_scan.model';
import { Employee } from '../employees/models/employee.model';
import { File } from '../files/models/file.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([PassportScan, Employee, File]),
  ],
  controllers: [PassportScansController],
  providers: [PassportScansService],
  exports: [PassportScansService],
})
export class PassportScansModule {}