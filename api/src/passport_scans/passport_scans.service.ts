import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PassportScan } from './models/passport_scan.model';
import { CreatePassportScanDto } from './dto/create-passport_scan.dto';

@Injectable()
export class PassportScansService {
  constructor(
      @InjectRepository(PassportScan)
      private readonly repo: Repository<PassportScan>,
  ) {}

  async create(createDto: CreatePassportScanDto): Promise<PassportScan> {
    const scan = this.repo.create({
      employee: { id: createDto.employeeId },
      file: { id: createDto.fileId },
    });
    return await this.repo.save(scan);
  }

  async findAll(): Promise<PassportScan[]> {
    return await this.repo.find({
      relations: ['employee', 'file'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<PassportScan> {
    const scan = await this.repo.findOne({
      where: { id },
      relations: ['employee', 'file'],
    });

    if (!scan) {
      throw new NotFoundException(`Passport scan with ID ${id} not found`);
    }

    return scan;
  }

  async findByEmployee(employeeId: number): Promise<PassportScan[]> {
    return await this.repo.find({
      where: { employee: { id: employeeId } },
      relations: ['file'],
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: number) {
    const result = await this.repo.softDelete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Passport scan with ID ${id} not found`);
    }

    return { message: `Passport scan #${id} successfully soft-deleted` };
  }
}