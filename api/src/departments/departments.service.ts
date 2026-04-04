import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './models/department.model';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
      @InjectRepository(Department)
      private readonly repo: Repository<Department>,
  ) {}

  async create(createDto: CreateDepartmentDto) {
    const departmentData: any = {
      name: createDto.name,
      comment: createDto.comment,
      organization: { id: createDto.organizationId },
    };

    if (createDto.parentId) {
      departmentData.parent = { id: createDto.parentId };
    }

    const department = this.repo.create(departmentData);
    return await this.repo.save(department);
  }

  async findAll() {
    return await this.repo.find({
      relations: ['organization', 'parent'],
      order: { id: 'ASC' },
    });
  }


  async findOne(id: number) {
    const department = await this.repo.findOne({
      where: { id },
      relations: ['organization', 'parent', 'children'],
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return department;
  }

  async update(id: number, updateDto: UpdateDepartmentDto) {
    const updateData: any = { ...updateDto };

    if (updateDto.organizationId) {
      updateData.organization = { id: updateDto.organizationId };
      delete updateData.organizationId;
    }

    if (updateDto.parentId) {
      updateData.parent = { id: updateDto.parentId };
      delete updateData.parentId;
    }

    await this.repo.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number) {
    const result = await this.repo.softDelete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return { message: `Department #${id} successfully soft-deleted` };
  }
}