import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './models/role.model';

@Injectable()
export class RolesService implements OnModuleInit {
  constructor(
      @InjectRepository(Role)
      private readonly repo: Repository<Role>,
  ) {}

  async onModuleInit() {
    await this.seedRoles();
  }

  private async seedRoles() {
    const rolesToCreate = ['Администратор', 'Менеджер по персоналу'];

    for (const roleName of rolesToCreate) {
      const existingRole = await this.repo.findOne({ where: { role: roleName } });

      if (!existingRole) {
        const newRole = this.repo.create({ role: roleName });
        await this.repo.save(newRole);
        console.log(`Role "${roleName}" has been seeded.`);
      }
    }
  }

  async findAll(): Promise<Role[]> {
    return await this.repo.find({ order: { id: 'ASC' } });
  }
}