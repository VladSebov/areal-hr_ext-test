import { Injectable, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {IsNull, Repository} from 'typeorm';
import { Organization } from './models/organization.model';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService implements OnApplicationBootstrap {
    constructor(
        @InjectRepository(Organization)
        private readonly repo: Repository<Organization>,
    ) {}

    async onApplicationBootstrap() {
        await this.seed();
    }

    async seed() {
        const count = await this.repo.count();
        if (count > 0) {
            return { message: 'Organizations already seeded' };
        }

        const seedData: CreateOrganizationDto[] = [
            { name: 'Главный офис', comment: 'г. Москва, ул. Центральная, д. 1' },
            { name: 'Филиал Север', comment: 'г. Санкт-Петербург, пр. Северный, д. 10' },
            { name: 'Региональный центр', comment: 'г. Новосибирск, ул. Ленина, д. 5' },
        ];

        const organizations = this.repo.create(seedData);
        await this.repo.save(organizations);

        return { message: `Successfully seeded ${seedData.length} organizations` };
    }

    async create(dto: CreateOrganizationDto) {
        const organization = this.repo.create(dto);
        return await this.repo.save(organization);
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