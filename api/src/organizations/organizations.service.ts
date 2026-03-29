import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';

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
}
