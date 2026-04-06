import { Test, TestingModule } from '@nestjs/testing';
import { HrOperationsService } from './hr_operations.service';

describe('HrOperationsService', () => {
  let service: HrOperationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HrOperationsService],
    }).compile();

    service = module.get<HrOperationsService>(HrOperationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
