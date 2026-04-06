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
    const position = await this.findOne(id);
    const updatedPosition = this.repo.merge(position, updateDto);
    return await this.repo.save(updatedPosition);
  }

  async remove(id: number) {
    const position = await this.findOne(id);
    await this.repo.softRemove(position);
    return { message: `Position #${id} soft-deleted` };
  }
}