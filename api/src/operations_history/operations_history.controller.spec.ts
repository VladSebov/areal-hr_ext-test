import { Test, TestingModule } from '@nestjs/testing';
import { OperationsHistoryController } from './operations_history.controller';
import { OperationsHistoryService } from './operations_history.service';

describe('OperationsHistoryController', () => {
  let controller: OperationsHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OperationsHistoryController],
      providers: [OperationsHistoryService],
    }).compile();

    controller = module.get<OperationsHistoryController>(OperationsHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
