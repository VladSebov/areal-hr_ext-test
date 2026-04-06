import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OperationsHistory } from './models/operations_history.model';

@Injectable()
export class OperationsHistoryService {
  constructor(
      @InjectRepository(OperationsHistory)
      private readonly repo: Repository<OperationsHistory>,
  ) {}

  async findAll(entityName?: string, entityId?: number) {
    const query = this.repo.createQueryBuilder('history');

    if (entityName) query.andWhere('history.entityName = :entityName', { entityName });
    if (entityId) query.andWhere('history.entityId = :entityId', { entityId });

    return await query.orderBy('history.createdAt', 'DESC').getMany();
  }

  async findOne(id: number) {
    const log = await this.repo.findOne({ where: { id } });
    if (!log) throw new NotFoundException(`Log #${id} not found`);
    return log;
  }
}