import { Test, TestingModule } from '@nestjs/testing';
import { PassportScansController } from './passport_scans.controller';
import { PassportScansService } from './passport_scans.service';

describe('PassportScansController', () => {
  let controller: PassportScansController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PassportScansController],
      providers: [PassportScansService],
    }).compile();

    controller = module.get<PassportScansController>(PassportScansController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
