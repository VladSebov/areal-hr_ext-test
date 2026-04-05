import { Module } from '@nestjs/common';
import { PassportScansService } from './passport_scans.service';
import { PassportScansController } from './passport_scans.controller';

@Module({
  controllers: [PassportScansController],
  providers: [PassportScansService],
})
export class PassportScansModule {}
