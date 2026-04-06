import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HrOperation } from './models/hr_operation.model';
import { CreateHrOperationDto } from './dto/create-hr_operation.dto';
import { UpdateHrOperationDto } from './dto/update-hr_operation.dto';

@Injectable()
export class HrOperationsService {
  constructor(
      @InjectRepository(HrOperation)
      private readonly repo: Repository<HrOperation>,
  ) {}

  async create(createDto: CreateHrOperationDto): Promise<HrOperation> {
    const operation = this.repo.create({
      ...createDto,
      employee: { id: createDto.employeeId },
      department: { id: createDto.departmentId },
      position: { id: createDto.positionId },
    });
    return await this.repo.save(operation);
  }

  async findAll(): Promise<HrOperation[]> {
    return await this.repo.find({
      relations: ['employee', 'department', 'position'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<HrOperation> {
    const operation = await this.repo.findOne({
      where: { id },
      relations: ['employee', 'department', 'position'],
    });

    if (!operation) {
      throw new NotFoundException(`HR Operation with ID ${id} not found`);
    }

    return operation;
  }

  async update(id: number, updateDto: UpdateHrOperationDto): Promise<HrOperation> {
    const operation = await this.findOne(id);

    const updateData = {
      ...updateDto,
      employee: updateDto.employeeId ? { id: updateDto.employeeId } : operation.employee,
      department: updateDto.departmentId ? { id: updateDto.departmentId } : operation.department,
      position: updateDto.positionId ? { id: updateDto.positionId } : operation.position,
    };

    this.repo.merge(operation, updateData as any);
    return await this.repo.save(operation);
  }

  async remove(id: number) {
    const operation = await this.findOne(id);

    await this.repo.softRemove(operation);

    return { message: `HR Operation #${id} successfully soft-removed` };
  }
}