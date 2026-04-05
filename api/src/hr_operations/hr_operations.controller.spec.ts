import { Test, TestingModule } from '@nestjs/testing';
import { HrOperationsController } from './hr_operations.controller';
import { HrOperationsService } from './hr_operations.service';

describe('HrOperationsController', () => {
  let controller: HrOperationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HrOperationsController],
      providers: [HrOperationsService],
    }).compile();

    controller = module.get<HrOperationsController>(HrOperationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
