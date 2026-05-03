import { Test, TestingModule } from '@nestjs/testing';
import { HrOperationsService } from './hr_operations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HrOperation } from './models/hr_operation.model';
import { EmployeesService } from '../employees/employees.service';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('HrOperationsService', () => {
  let service: HrOperationsService;
  let repo: Repository<HrOperation>;
  let employeesService: EmployeesService;
  let usersService: UsersService;

  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    softRemove: jest.fn(),
  };

  const mockEmployeesService = {
    remove: jest.fn(),
    restore: jest.fn(),
  };

  const mockUsersService = {
    softRemoveByEmployee: jest.fn(),
    restoreByEmployee: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HrOperationsService,
        { provide: getRepositoryToken(HrOperation), useValue: mockRepo },
        { provide: EmployeesService, useValue: mockEmployeesService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<HrOperationsService>(HrOperationsService);
    repo = module.get<Repository<HrOperation>>(getRepositoryToken(HrOperation));
    employeesService = module.get<EmployeesService>(EmployeesService);
    usersService = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an operation and call dismissal logic if type is DISMISSAL', async () => {
      const dto = {
        operationType: 'DISMISSAL',
        employeeId: 1,
        departmentId: 2,
        positionId: 3,
        date: '2026-05-01',
      };
      const operation = { id: 100, ...dto };

      mockRepo.create.mockReturnValue(operation);
      mockRepo.save.mockResolvedValue(operation);

      const result = await service.create(dto as any);

      expect(mockRepo.save).toHaveBeenCalled();
      expect(employeesService.remove).toHaveBeenCalledWith(dto.employeeId);
      expect(usersService.softRemoveByEmployee).toHaveBeenCalledWith(dto.employeeId);
      expect(result).toEqual(operation);
    });

    it('should not call dismissal logic for recruitment type', async () => {
      const dto = { operationType: 'RECRUITMENT', employeeId: 1 };
      mockRepo.create.mockReturnValue(dto);
      mockRepo.save.mockResolvedValue(dto);

      await service.create(dto as any);

      expect(employeesService.remove).not.toHaveBeenCalled();
      expect(usersService.softRemoveByEmployee).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should throw BadRequestException if trying to remove not the latest operation', async () => {
      const targetOp = { id: 1, operationType: 'RECRUITMENT', employee: { id: 10 } };
      const newerOp = { id: 2, employee: { id: 10 } };

      mockRepo.findOne
          .mockResolvedValueOnce(targetOp)
          .mockResolvedValueOnce(newerOp);

      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
    });

    it('should restore employee and user when removing a DISMISSAL operation', async () => {
      const dismissalOp = {
        id: 5,
        operationType: 'DISMISSAL',
        employee: { id: 10 }
      };

      mockRepo.findOne.mockResolvedValue(dismissalOp);
      mockRepo.softRemove.mockResolvedValue(dismissalOp);

      await service.remove(5);

      expect(employeesService.restore).toHaveBeenCalledWith(10);
      expect(usersService.restoreByEmployee).toHaveBeenCalledWith(10);
      expect(mockRepo.softRemove).toHaveBeenCalledWith(dismissalOp);
    });
  });

  describe('findAll', () => {
    it('should return all active operations sorted by date', async () => {
      const ops = [{ id: 1 }, { id: 2 }];
      mockRepo.find.mockResolvedValue(ops);

      const result = await service.findAll();

      expect(mockRepo.find).toHaveBeenCalledWith(expect.objectContaining({
        order: { createdAt: 'DESC' },
        relations: ['employee', 'department', 'position']
      }));
      expect(result).toEqual(ops);
    });
  });
});