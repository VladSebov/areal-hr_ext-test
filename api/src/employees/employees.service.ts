import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './models/employee.model';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
      @InjectRepository(Employee)
      private readonly repo: Repository<Employee>,
  ) {}

  async create(createDto: CreateEmployeeDto) {
    const employee = this.repo.create(createDto);
    return await this.repo.save(employee);
  }

  async findAll() {
    return await this.repo.find({
      relations: ['passportScans', 'passportScans.file'],
      order: { lastName: 'ASC' }
    });
  }

  async findOne(id: number) {
    const employee = await this.repo.findOne({
      where: { id },
      relations: [
        'operations',
        'users',
        'passportScans',
        'passportScans.file'
      ],
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  async update(id: number, updateDto: UpdateEmployeeDto) {
    const employee = await this.findOne(id);

    this.repo.merge(employee, updateDto);
    return await this.repo.save(employee);
  }

  async remove(id: number) {
    const employee = await this.findOne(id);
    await this.repo.softRemove(employee);
    return { message: `Employee #${id} successfully soft-deleted` };
  }
}