import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Position } from './models/position.model';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionsService {
  constructor(
      @InjectRepository(Position)
      private readonly repo: Repository<Position>,
  ) {}

  async create(createDto: CreatePositionDto) {
    const position = this.repo.create(createDto);
    return await this.repo.save(position);
  }

  async findAll() {
    return await this.repo.find({
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const position = await this.repo.findOne({ where: { id } });
    if (!position) throw new NotFoundException(`Position #${id} not found`);
    return position;
  }

  async update(id: number, updateDto: UpdatePositionDto) {
    await this.repo.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const result = await this.repo.softDelete(id);
    if (result.affected === 0) throw new NotFoundException(`Position #${id} not found`);
    return { message: `Position #${id} soft-deleted` };
  }
}