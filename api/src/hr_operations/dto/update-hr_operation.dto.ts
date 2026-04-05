import { PartialType } from '@nestjs/mapped-types';
import { CreateHrOperationDto } from './create-hr_operation.dto';

export class UpdateHrOperationDto extends PartialType(CreateHrOperationDto) {}
