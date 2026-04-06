import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './models/organization.model';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
    constructor(
        @InjectRepository(Organization)
        private readonly repo: Repository<Organization>,
    ) {}

    async create(dto: CreateOrganizationDto) {
        const organization = this.repo.create(dto);
        return await this.repo.save(organization);
    }

    async findAll() {
        return await this.repo.find({
            order: { id: 'ASC' },
        });
    }

    async findOne(id: number) {
        const organization = await this.repo.findOneBy({ id });
        if (!organization) {
            throw new NotFoundException(`Organization ${id} not found`);
        }
        return organization;
    }

    async update(id: number, updateDto: UpdateOrganizationDto) {
        const organization = await this.findOne(id);
        const updatedOrganization = this.repo.merge(organization, updateDto);
        return await this.repo.save(updatedOrganization);
    }

    async softRemove(id: number) {
        const organization = await this.findOne(id);
        await this.repo.softRemove(organization);
        return { message: `Organization #${id} soft-deleted` };
    }
}