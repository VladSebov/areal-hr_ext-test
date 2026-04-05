import { Injectable } from '@nestjs/common';
import { CreateHrOperationDto } from './dto/create-hr_operation.dto';
import { UpdateHrOperationDto } from './dto/update-hr_operation.dto';

@Injectable()
export class HrOperationsService {
  create(createHrOperationDto: CreateHrOperationDto) {
    return 'This action adds a new hrOperation';
  }

  findAll() {
    return `This action returns all hrOperations`;
  }

  findOne(id: number) {
    return `This action returns a #${id} hrOperation`;
  }

  update(id: number, updateHrOperationDto: UpdateHrOperationDto) {
    return `This action updates a #${id} hrOperation`;
  }

  remove(id: number) {
    return `This action removes a #${id} hrOperation`;
  }
}
