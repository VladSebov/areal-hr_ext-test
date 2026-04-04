import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './models/organization.model';

@Injectable()
export class OrganizationsService {
    constructor(
        @InjectRepository(Organization)
        private readonly repo: Repository<Organization>,
    ) {}

    async create(name: string, comment?: string) {
        const org = this.repo.create({ name, comment });
        return this.repo.save(org);
    }

    findAll() {
        return this.repo.find();
    }

    async findOne(id: number) {
        return await this.repo.findOneBy({ id });
    }

    async update(id: number, data: { name?: string; comment?: string }) {
        await this.repo.update(id, data);
        return this.findOne(id);
    }

    async softRemove(id: number) {
        return await this.repo.softDelete(id);
    }
}
