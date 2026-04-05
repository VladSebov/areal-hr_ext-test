import { PartialType } from '@nestjs/mapped-types';
import { CreateOperationsHistoryDto } from './create-operations_history.dto';

export class UpdateOperationsHistoryDto extends PartialType(CreateOperationsHistoryDto) {}
