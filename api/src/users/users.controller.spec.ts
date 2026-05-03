import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import {AuthenticatedGuard} from "../auth/guards/authenticated.guard";
import {RolesGuard} from "../auth/guards/roles.guard";

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    findAll: jest.fn().mockResolvedValue([{ id: 1, login: 'admin' }]),
    create: jest.fn().mockImplementation((dto) => Promise.resolve({ id: 1, ...dto })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
      ],
    })
        .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
        .overrideGuard(RolesGuard).useValue({ canActivate: () => true })
        .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('findAll should call usersService.findAll with params', async () => {
    const query = { search: 'test', roleId: 1 };
    await controller.findAll(query.search, query.roleId);

    expect(service.findAll).toHaveBeenCalledWith(query);
  });
});