import { PartialType } from '@nestjs/mapped-types';
import { CreatePassportScanDto } from './create-passport_scan.dto';

export class UpdatePassportScanDto extends PartialType(CreatePassportScanDto) {}
