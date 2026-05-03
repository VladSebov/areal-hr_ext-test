import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationsService } from './organizations.service';
import { Organization } from './models/organization.model';
import { NotFoundException } from '@nestjs/common';

describe('OrganizationsService', () => {
  let service: OrganizationsService;
  let repo: Repository<Organization>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    merge: jest.fn(),
    softRemove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        {
          provide: getRepositoryToken(Organization),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<OrganizationsService>(OrganizationsService);
    repo = module.get<Repository<Organization>>(getRepositoryToken(Organization));

    jest.clearAllMocks();
  });

  it('service should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create an organization', async () => {
      const dto = { name: 'ООО Ромашка', inn: '1234567890' };
      const organization = { id: 1, ...dto };

      mockRepository.create.mockReturnValue(organization);
      mockRepository.save.mockResolvedValue(organization);

      const result = await service.create(dto as any);

      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalledWith(organization);
      expect(result).toEqual(organization);
    });
  });

  describe('findAll', () => {
    it('should return a list of active organizations', async () => {
      const organizations = [
        { id: 1, name: 'Газпром' },
        { id: 2, name: 'Сбербанк' },
      ];
      mockRepository.find.mockResolvedValue(organizations);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith(expect.objectContaining({
        order: { id: 'ASC' }
      }));
      expect(result).toEqual(organizations);
    });
  });

  describe('findOne', () => {
    it('should return organization if found', async () => {
      const organization = { id: 7, name: 'Яндекс' };
      mockRepository.findOneBy.mockResolvedValue(organization);

      const result = await service.findOne(7);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 7 });
      expect(result).toEqual(organization);
    });

    it('should throw NotFoundException if organization does not exist', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and save organization', async () => {
      const existingOrg = { id: 1, name: 'Старое название' };
      const updateDto = { name: 'Новое название' };
      const updatedOrg = { ...existingOrg, ...updateDto };

      mockRepository.findOneBy.mockResolvedValue(existingOrg);
      mockRepository.merge.mockReturnValue(updatedOrg);
      mockRepository.save.mockResolvedValue(updatedOrg);

      const result = await service.update(1, updateDto as any);

      expect(mockRepository.merge).toHaveBeenCalledWith(existingOrg, updateDto);
      expect(mockRepository.save).toHaveBeenCalledWith(updatedOrg);
      expect(result.name).toBe('Новое название');
    });
  });

  describe('softRemove', () => {
    it('should call softRemove and return success message', async () => {
      const organization = { id: 5, name: 'Удаляемая компания' };
      mockRepository.findOneBy.mockResolvedValue(organization);
      mockRepository.softRemove.mockResolvedValue(organization);

      const result = await service.softRemove(5);

      expect(mockRepository.softRemove).toHaveBeenCalledWith(organization);
      expect(result.message).toContain('soft-deleted');
    });
  });
});