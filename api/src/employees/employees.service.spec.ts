import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesService } from './employees.service';
import {ILike, Repository} from 'typeorm';
import {Employee} from "./models/employee.model";
import {getRepositoryToken} from "@nestjs/typeorm";
import {BadRequestException, NotFoundException} from "@nestjs/common";

describe('EmployeesService', () => {
  let service: EmployeesService;
  let repo: Repository<Employee>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    softRemove: jest.fn(),
    restore: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      withDeleted: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
          EmployeesService,
        {
          provide: getRepositoryToken(Employee),
          useValue: mockRepository,
        }
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
    repo = module.get<Repository<Employee>>(getRepositoryToken(Employee))
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create an employee', async () => {
      const dto = {
        lastName: 'Тест',
        firstName: 'Тест',
        middleName: 'Тест',
        birthDate: "1970-01-01",
        passportSeries: '0000',
        passportNumber: '000000',
        passportCode: '000000',
        passportPlace: 'Тест',
        passportDate: "1970-01-01",
        registrationRegion: 'Тест',
        registrationLocality: 'Тест',
        registrationStreet: 'Тест',
        registrationHouse: '0',
      };
      const createdEmployee = {id: 1, ...dto};

      mockRepository.create.mockReturnValue(createdEmployee);
      mockRepository.save.mockResolvedValue(createdEmployee);

      const result = await service.create(dto as any);

      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(createdEmployee);
    });
  });

  describe('getFilterValues', () => {
    it('should return unique regions and localities sorted', async () => {
      const qb = mockRepository.createQueryBuilder();
      qb.getRawMany
          .mockResolvedValueOnce([{ region: 'B' }, { region: 'A' }])
          .mockResolvedValueOnce([{ locality: 'Y' }, { locality: 'X' }]);

      const result = await service.getFilterValues();

      expect(result.regions).toEqual(['A', 'B']);
      expect(result.localities).toEqual(['X', 'Y']);
      expect(qb.select).toHaveBeenCalledTimes(2);
    });
  });

  describe('findAll', () => {
    it('should call find with correct filters and ILike search', async () => {
      const query = { search: 'Иван', region: 'Регион' };
      mockRepository.find.mockResolvedValue([]);

      await service.findAll(query);

      expect(mockRepository.find).toHaveBeenCalledWith(expect.objectContaining({
        where: [
          { registrationRegion: 'Регион', lastName: ILike('%Иван%') },
          { registrationRegion: 'Регион', firstName: ILike('%Иван%') },
          { registrationRegion: 'Регион', passportNumber: ILike('%Иван%') },
        ],
        withDeleted: undefined,
      }));
    });
    it('should include deleted employees when showDeleted is true', async () => {
      const query = { showDeleted: true, locality: 'Москва' };
      mockRepository.find.mockResolvedValue([]);

      await service.findAll(query);

      expect(mockRepository.find).toHaveBeenCalledWith(expect.objectContaining({
        where: { registrationLocality: 'Москва' },
        withDeleted: true,
      }));
    });
  });

  describe('findOne', () => {
    it('should return an employee if found', async () => {
      const employee = { id: 1, lastName: 'Тест' };
      mockRepository.findOne.mockResolvedValue(employee);

      const result = await service.findOne(1);
      expect(result).toEqual(employee);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an active employee', async () => {
      const employee = { id: 1, lastName: 'Иванов', deletedAt: null };
      const dto = { lastName: 'Петров' };

      mockRepository.findOne.mockResolvedValue(employee);
      mockRepository.save.mockResolvedValue({ ...employee, ...dto });

      const result = await service.update(1, dto);

      expect(mockRepository.merge).toHaveBeenCalledWith(employee, dto);
      expect(result.lastName).toBe('Петров');
    });

    it('should throw BadRequestException if employee is dismissed (soft-deleted)', async () => {
      const employee = { id: 1, deletedAt: new Date() };
      mockRepository.findOne.mockResolvedValue(employee);

      await expect(service.update(1, { firstName: 'Тест' }))
          .rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should soft-remove an active employee', async () => {
      const employee = { id: 1, deletedAt: null };
      mockRepository.findOne.mockResolvedValue(employee);

      const result = await service.remove(1);

      expect(mockRepository.softRemove).toHaveBeenCalledWith(employee);
      expect(result.message).toContain('successfully soft-deleted');
    });

    it('should throw BadRequestException if already dismissed', async () => {
      mockRepository.findOne.mockResolvedValue({ id: 1, deletedAt: new Date() });
      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('restore', () => {
    it('should restore a deleted employee', async () => {
      const employee = { id: 1, deletedAt: new Date() };
      mockRepository.findOne.mockResolvedValue(employee);

      const result = await service.restore(1);

      expect(mockRepository.restore).toHaveBeenCalledWith(1);
      expect(result.message).toContain('successfully restored');
    });

    it('should return message if employee is already active', async () => {
      const employee = { id: 1, deletedAt: null };
      mockRepository.findOne.mockResolvedValue(employee);

      mockRepository.restore.mockClear();

      const result = await service.restore(1);

      expect(mockRepository.restore).not.toHaveBeenCalled();
      expect(result.message).toContain('already active');
    });
  });

});
