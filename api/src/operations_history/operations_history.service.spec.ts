import { Test, TestingModule } from '@nestjs/testing';
import { OperationsHistoryService } from './operations_history.service';

describe('OperationsHistoryService', () => {
  let service: OperationsHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OperationsHistoryService],
    }).compile();

    service = module.get<OperationsHistoryService>(OperationsHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
