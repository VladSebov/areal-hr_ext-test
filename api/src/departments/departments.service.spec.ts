import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DepartmentsService } from './departments.service';
import { Department } from './models/department.model';
import { NotFoundException } from '@nestjs/common';

describe('DepartmentsService', () => {
  let service: DepartmentsService;
  let repo: Repository<Department>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    softRemove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentsService,
        {
          provide: getRepositoryToken(Department),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<DepartmentsService>(DepartmentsService);
    repo = module.get<Repository<Department>>(getRepositoryToken(Department));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a department with a parent', async () => {
      const dto = { name: 'IT', organizationId: 1, parentId: 2, comment: 'Test' };
      const createdDept = { id: 10, ...dto, parent: { id: 2 }, organization: { id: 1 } };

      mockRepository.create.mockReturnValue(createdDept);
      mockRepository.save.mockResolvedValue(createdDept);

      const result = await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        name: dto.name,
        comment: dto.comment,
        organization: { id: dto.organizationId },
        parent: { id: dto.parentId },
      });
      expect(result).toEqual(createdDept);
    });

    it('should successfully create a department without a parent', async () => {
      const dto = { name: 'HR', organizationId: 1 };

      await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        name: dto.name,
        organization: { id: dto.organizationId },
        comment: undefined,
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of departments', async () => {
      const departments = [{ id: 1, name: 'Dept 1' }];
      mockRepository.find.mockResolvedValue(departments);

      const result = await service.findAll();

      expect(result).toEqual(departments);
      expect(mockRepository.find).toHaveBeenCalledWith(expect.objectContaining({
        relations: ['organization', 'parent'],
      }));
    });
  });

  describe('findOne', () => {
    it('should return a department if found', async () => {
      const department = { id: 1, name: 'Test Dept' };
      mockRepository.findOne.mockResolvedValue(department);

      const result = await service.findOne(1);

      expect(result).toEqual(department);
    });

    it('should throw NotFoundException if department not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update department data and parent link', async () => {
      const existingDept = { id: 1, name: 'Old Name', organization: { id: 1 } };
      const updateDto = { name: 'New Name', parentId: 5 };

      mockRepository.findOne.mockResolvedValue(existingDept);
      mockRepository.save.mockResolvedValue({ ...existingDept, ...updateDto });

      await service.update(1, updateDto);

      expect(mockRepository.merge).toHaveBeenCalledWith(
          existingDept,
          expect.objectContaining({
            name: 'New Name',
            parent: { id: 5 },
          }),
      );
    });
  });

  describe('remove', () => {
    it('should call softRemove and return success message', async () => {
      const department = { id: 1, name: 'To Delete' };
      mockRepository.findOne.mockResolvedValue(department);
      mockRepository.softRemove.mockResolvedValue(department);

      const result = await service.remove(1);

      expect(mockRepository.softRemove).toHaveBeenCalledWith(department);
      expect(result.message).toContain('successfully soft-deleted');
    });
  });
});