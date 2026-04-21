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

  async getFilterValues() {
    const regions = await this.repo
        .createQueryBuilder('employee')
        .select('DISTINCT employee.registrationRegion', 'region')
        .where('employee.registrationRegion IS NOT NULL')
        .withDeleted()
        .getRawMany();

    const localities = await this.repo
        .createQueryBuilder('employee')
        .select('DISTINCT employee.registrationLocality', 'locality')
        .where('employee.registrationLocality IS NOT NULL')
        .withDeleted()
        .getRawMany();

    return {
      regions: regions.map(r => r.region).sort(),
      localities: localities.map(l => l.locality).sort(),
    };
  }

  async findAll(query?: {
    search?: string;
    showDeleted?: boolean;
    region?: string;
    locality?: string
  }) {
    const { search, showDeleted, region, locality } = query || {};
    const where: any = {};

    if (region) {
      where.registrationRegion = region;
    }

    if (locality) {
      where.registrationLocality = locality;
    }

    const findOptions: any = {
      relations: ['passportScans', 'passportScans.file'],
      order: { lastName: 'ASC' },
      withDeleted: showDeleted,
    };

    if (search) {
      findOptions.where = [
        { ...where, lastName: ILike(`%${search}%`) },
        { ...where, firstName: ILike(`%${search}%`) },
        { ...where, passportNumber: ILike(`%${search}%`) },
      ];
    } else {
      findOptions.where = where;
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

  async restore(id: number) {
    const employee = await this.repo.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    if (!employee.deletedAt) {
      return { message: `Employee #${id} is already active` };
    }

    await this.repo.restore(id);

    return { message: `Employee #${id} successfully restored` };
  }
}