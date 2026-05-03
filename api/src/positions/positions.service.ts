import { Injectable, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Position } from './models/position.model';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionsService implements OnApplicationBootstrap {
  constructor(
      @InjectRepository(Position)
      private readonly repo: Repository<Position>,
  ) {}

  async onApplicationBootstrap() {
    await this.seed();
  }

  async seed() {
    const count = await this.repo.count();
    if (count > 0) {
      return { message: 'Positions already seeded' };
    }

    const seedData: CreatePositionDto[] = [
      { name: 'Генеральный директор' },
      { name: 'Технический директор' },
      { name: 'Системный администратор' },
      { name: 'Программист NestJS' },
      { name: 'Менеджер по персоналу' },
      { name: 'Бухгалтер' },
    ];

    const positions = this.repo.create(seedData);
    await this.repo.save(positions);

    return { message: `Successfully seeded ${seedData.length} positions` };
  }

  async create(createDto: CreatePositionDto) {
    const position = this.repo.create(createDto);
    return await this.repo.save(position);
  }

  async findAll() {
    return await this.repo.find({
      where: {
        deletedAt: IsNull(),
      },
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