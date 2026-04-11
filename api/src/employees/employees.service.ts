import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Employee } from './models/employee.model';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
      @InjectRepository(Employee)
      private readonly repo: Repository<Employee>,
  ) {
  }

  async create(createDto: CreateEmployeeDto) {
    const employee = this.repo.create(createDto);
    return await this.repo.save(employee);
  }

  async findAll(query?: { search?: string; showDeleted?: boolean }) {
    const { search, showDeleted } = query || {};
    const findOptions: any = {
      relations: ['passportScans', 'passportScans.file'],
      order: { lastName: 'ASC' },
      withDeleted: showDeleted,
    };

    if (search) {
      findOptions.where = [
        { lastName: ILike(`%${search}%`) },
        { firstName: ILike(`%${search}%`) },
        { passportNumber: ILike(`%${search}%`) },
      ];
    }

    return await this.repo.find(findOptions);
  }

  async findOne(id: number, withDeleted = false) {
    const employee = await this.repo.findOne({
      where: {id},
      relations: [
        'operations',
        'users',
        'passportScans',
        'passportScans.file'
      ],
      withDeleted,
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  async update(id: number, updateDto: UpdateEmployeeDto) {
    const employee = await this.findOne(id, true);

    if (employee.deletedAt) {
      throw new BadRequestException(`Cannot update employee ID ${id} because they are dismissed`);
    }

    this.repo.merge(employee, updateDto);
    return await this.repo.save(employee);
  }

  async remove(id: number) {
    const employee = await this.findOne(id);

    if (employee.deletedAt) {
      throw new BadRequestException(`Employee ID ${id} is already dismissed`);
    }

    await this.repo.softRemove(employee);
    return {message: `Employee #${id} successfully soft-deleted`};
  }
}