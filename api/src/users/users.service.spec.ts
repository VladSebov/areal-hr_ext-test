import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './models/user.model';
import { Role } from '../roles/models/role.model';
import { Employee } from '../employees/models/employee.model';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';

jest.mock('argon2');

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: any;
  let roleRepo: any;
  let employeeRepo: any;
  let configService: ConfigService;

  const mockRepo = () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
    softRemove: jest.fn(),
    recover: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    }),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepo() },
        { provide: getRepositoryToken(Role), useValue: mockRepo() },
        { provide: getRepositoryToken(Employee), useValue: mockRepo() },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'ADMIN_LOGIN') return 'admin';
              if (key === 'ADMIN_PASSWORD') return 'secret';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepo = module.get(getRepositoryToken(User));
    roleRepo = module.get(getRepositoryToken(Role));
    employeeRepo = module.get(getRepositoryToken(Employee));
    configService = module.get<ConfigService>(ConfigService);
  });

  it('service should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('seedAdmin', () => {
    it('should skip if admin already exists', async () => {
      userRepo.findOne.mockResolvedValue({ login: 'admin' });
      const result = await service.onApplicationBootstrap();
      expect(result).toBeUndefined();
      expect(userRepo.save).not.toHaveBeenCalled();
    });

    it('should create admin if not exists and role found', async () => {
      userRepo.findOne.mockResolvedValue(null);
      roleRepo.findOne.mockResolvedValue({ id: 1, role: 'Администратор' });
      employeeRepo.findOne.mockResolvedValue(null);
      employeeRepo.create.mockReturnValue({});
      employeeRepo.save.mockResolvedValue({ id: 100 });
      userRepo.create.mockReturnValue({});
      (argon2.hash as jest.Mock).mockResolvedValue('hashed_pwd');

      const result = await service.onApplicationBootstrap();

      expect(userRepo.save).toHaveBeenCalled();
      expect(result).toHaveProperty('message', expect.stringContaining('created successfully'));
    });
  });

  describe('findAll', () => {
    it('should return a list of users', async () => {
      const users = [{ id: 1, login: 'user1' }];
      const qb = userRepo.createQueryBuilder();
      qb.getMany.mockResolvedValue(users);

      const result = await service.findAll({ search: 'test' });

      expect(qb.andWhere).toHaveBeenCalledWith(
          expect.stringContaining('user.login ILIKE :search'),
          expect.objectContaining({ search: '%test%' })
      );
      expect(result).toEqual(users);
    });
  });

  describe('create', () => {
    it('should throw BadRequestException if login taken', async () => {
      userRepo.findOne.mockResolvedValue({ id: 1 });
      const dto = {
        login: 'exists',
        password: '123',
        roleId: 1,
        employeeId: 1,
        firstName: 'Иван',
        lastName: 'Иванов'
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should hash password and save user', async () => {
      userRepo.findOne.mockResolvedValue(null);
      (argon2.hash as jest.Mock).mockResolvedValue('hash');
      const dto = {
        login: 'new',
        password: 'password',
        roleId: 1,
        employeeId: 2,
        firstName: 'Петр',
        lastName: 'Петров'
      };
      const savedUser = { ...dto, passwordHash: 'hash', id: 10 };

      userRepo.create.mockReturnValue(savedUser);
      userRepo.save.mockResolvedValue(savedUser);

      const result = await service.create(dto);

      expect(argon2.hash).toHaveBeenCalledWith('password');
      expect(result).not.toHaveProperty('passwordHash');
      expect(result.id).toBe(10);
    });
  });

  describe('findOne', () => {
    it('should return user if active', async () => {
      const user = { id: 1, employee: { deletedAt: null } };
      userRepo.findOne.mockResolvedValue(user);

      expect(await service.findOne(1)).toEqual(user);
    });

    it('should throw NotFoundException if employee is deleted', async () => {
      const user = { id: 1, employee: { deletedAt: new Date() } };
      userRepo.findOne.mockResolvedValue(user);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft remove user', async () => {
      const user = { id: 1, employee: { deletedAt: null } };
      userRepo.findOne.mockResolvedValue(user);

      const result = await service.remove(1);

      expect(userRepo.softRemove).toHaveBeenCalledWith(user);
      expect(result.message).toContain('successfully soft-removed');
    });
  });
});