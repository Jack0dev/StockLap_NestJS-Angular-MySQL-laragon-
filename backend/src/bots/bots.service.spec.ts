import { Test, TestingModule } from '@nestjs/testing';
import { BotsService } from './bots.service';
import { UsersService } from '../users/users.service';
import { StocksService } from '../stocks/stocks.service';
import { OrdersService } from '../orders/orders.service';

const mockUsersService = {
  findByEmail: jest.fn(),
  save: jest.fn(),
};

const mockStocksService = {
  findAll: jest.fn(),
};

const mockOrdersService = {
  save: jest.fn(),
};

describe('BotsService', () => {
  let service: BotsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BotsService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: StocksService, useValue: mockStocksService },
        { provide: OrdersService, useValue: mockOrdersService },
      ],
    }).compile();

    service = module.get<BotsService>(BotsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
