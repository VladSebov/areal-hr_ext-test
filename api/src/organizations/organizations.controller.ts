import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';

@Controller('organizations')
export class OrganizationsController {
    constructor(private readonly service: OrganizationsService) {}

    @Post()
    create(@Body() data: { name: string; comment?: string }) {
        console.log('POST request received!', data);
        return this.service.create(data.name, data.comment);
    }

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(+id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateData: { name?: string; comment?: string }
    ) {
        return this.service.update(+id, updateData);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.softRemove(+id);
    }
}