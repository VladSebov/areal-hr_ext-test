import { Injectable } from '@nestjs/common';
import { CreateOperationsHistoryDto } from './dto/create-operations_history.dto';
import { UpdateOperationsHistoryDto } from './dto/update-operations_history.dto';

@Injectable()
export class OperationsHistoryService {
  create(createOperationsHistoryDto: CreateOperationsHistoryDto) {
    return 'This action adds a new operationsHistory';
  }

  findAll() {
    return `This action returns all operationsHistory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} operationsHistory`;
  }

  update(id: number, updateOperationsHistoryDto: UpdateOperationsHistoryDto) {
    return `This action updates a #${id} operationsHistory`;
  }

  remove(id: number) {
    return `This action removes a #${id} operationsHistory`;
  }
}
