import { Injectable } from '@nestjs/common';
import { CreatePassportScanDto } from './dto/create-passport_scan.dto';
import { UpdatePassportScanDto } from './dto/update-passport_scan.dto';

@Injectable()
export class PassportScansService {
  create(createPassportScanDto: CreatePassportScanDto) {
    return 'This action adds a new passportScan';
  }

  findAll() {
    return `This action returns all passportScans`;
  }

  findOne(id: number) {
    return `This action returns a #${id} passportScan`;
  }

  update(id: number, updatePassportScanDto: UpdatePassportScanDto) {
    return `This action updates a #${id} passportScan`;
  }

  remove(id: number) {
    return `This action removes a #${id} passportScan`;
  }
}
