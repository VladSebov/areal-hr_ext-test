import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PositionsService } from './positions.service';
import { Position } from './models/position.model';
import { NotFoundException } from '@nestjs/common';

describe('PositionsService', () => {
  let service: PositionsService;
  let repo: Repository<Position>;

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
        PositionsService,
        {
          provide: getRepositoryToken(Position),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PositionsService>(PositionsService);
    repo = module.get<Repository<Position>>(getRepositoryToken(Position));

    jest.clearAllMocks();
  });

  it('service should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a position', async () => {
      const dto = { name: 'Программист', comment: 'Разработка ПО' };
      const createdPosition = { id: 1, ...dto };

      mockRepository.create.mockReturnValue(createdPosition);
      mockRepository.save.mockResolvedValue(createdPosition);

      const result = await service.create(dto as any);

      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalledWith(createdPosition);
      expect(result).toEqual(createdPosition);
    });
  });

  describe('findAll', () => {
    it('should return a list of active positions', async () => {
      const positions = [
        { id: 1, name: 'Бухгалтер' },
        { id: 2, name: 'Директор' },
      ];
      mockRepository.find.mockResolvedValue(positions);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith(expect.objectContaining({
        order: { id: 'ASC' }
      }));
      expect(result).toEqual(positions);
    });
  });

  describe('findOne', () => {
    it('should return a position if found', async () => {
      const position = { id: 5, name: 'Менеджер' };
      mockRepository.findOne.mockResolvedValue(position);

      const result = await service.findOne(5);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 5 } });
      expect(result).toEqual(position);
    });

    it('should throw NotFoundException if position not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and save the position', async () => {
      const existingPosition = { id: 1, name: 'Стажер' };
      const updateDto = { name: 'Младший разработчик' };
      const mergedPosition = { ...existingPosition, ...updateDto };

      mockRepository.findOne.mockResolvedValue(existingPosition);
      mockRepository.merge.mockReturnValue(mergedPosition);
      mockRepository.save.mockResolvedValue(mergedPosition);

      const result = await service.update(1, updateDto as any);

      expect(mockRepository.merge).toHaveBeenCalledWith(existingPosition, updateDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mergedPosition);
      expect(result.name).toBe('Младший разработчик');
    });
  });

  describe('remove', () => {
    it('should call softRemove and return a success message', async () => {
      const position = { id: 10, name: 'Тестировщик' };
      mockRepository.findOne.mockResolvedValue(position);
      mockRepository.softRemove.mockResolvedValue(position);

      const result = await service.remove(10);

      expect(mockRepository.softRemove).toHaveBeenCalledWith(position);
      expect(result.message).toContain('soft-deleted');
    });
  });
});