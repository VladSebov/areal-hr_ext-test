import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PassportScansService } from './passport_scans.service';
import { PassportScan } from './models/passport_scan.model';
import { NotFoundException } from '@nestjs/common';

describe('PassportScansService', () => {
  let service: PassportScansService;
  let repo: Repository<PassportScan>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    softRemove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PassportScansService,
        {
          provide: getRepositoryToken(PassportScan),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PassportScansService>(PassportScansService);
    repo = module.get<Repository<PassportScan>>(getRepositoryToken(PassportScan));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a passport scan link', async () => {
      const dto = { employeeId: 1, fileId: 50 };
      const createdScan = { id: 10, employee: { id: 1 }, file: { id: 50 } };

      mockRepository.create.mockReturnValue(createdScan);
      mockRepository.save.mockResolvedValue(createdScan);

      const result = await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        employee: { id: dto.employeeId },
        file: { id: dto.fileId },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(createdScan);
      expect(result).toEqual(createdScan);
    });
  });

  describe('findAll', () => {
    it('should return all active scans', async () => {
      const scans = [{ id: 1, employee: { id: 1 }, file: { id: 5 } }];
      mockRepository.find.mockResolvedValue(scans);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith(expect.objectContaining({
        relations: ['employee', 'file'],
        order: { createdAt: 'DESC' },
      }));
      expect(result).toEqual(scans);
    });
  });

  describe('findOne', () => {
    it('should return a scan if found', async () => {
      const scan = { id: 1, employee: { id: 1 } };
      mockRepository.findOne.mockResolvedValue(scan);

      const result = await service.findOne(1);

      expect(result).toEqual(scan);
      expect(mockRepository.findOne).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 1 },
      }));
    });

    it('should throw NotFoundException if scan not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
          new NotFoundException('Passport scan with ID 999 not found'),
      );
    });
  });

  describe('findByEmployee', () => {
    it('should return scans for a specific employee', async () => {
      const employeeId = 5;
      const scans = [{ id: 1, file: { id: 100 } }];
      mockRepository.find.mockResolvedValue(scans);

      const result = await service.findByEmployee(employeeId);

      expect(mockRepository.find).toHaveBeenCalledWith(expect.objectContaining({
        where: { employee: { id: employeeId } },
        relations: ['file'],
      }));
      expect(result).toEqual(scans);
    });
  });

  describe('remove', () => {
    it('should soft-delete a scan and return success message', async () => {
      const scan = { id: 1, employee: { id: 1 } };
      mockRepository.findOne.mockResolvedValue(scan);
      mockRepository.softRemove.mockResolvedValue(scan);

      const result = await service.remove(1);

      expect(mockRepository.softRemove).toHaveBeenCalledWith(scan);
      expect(result.message).toBe('Passport scan #1 successfully soft-deleted');
    });
  });
});