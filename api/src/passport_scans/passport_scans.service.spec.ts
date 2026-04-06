import { Test, TestingModule } from '@nestjs/testing';
import { PassportScansService } from './passport_scans.service';

describe('PassportScansService', () => {
  let service: PassportScansService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PassportScansService],
    }).compile();

    service = module.get<PassportScansService>(PassportScansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
