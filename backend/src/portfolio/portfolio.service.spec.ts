import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioService } from './portfolio.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Portfolio } from './entities/portfolio.entity';
import { Transaction } from '../orders/entities/transaction.entity';

describe('PortfolioService', () => {
  let service: PortfolioService;

  const mockPortfolioRepo = {
    find: jest.fn(),
  };

  const mockTransactionRepo = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortfolioService,
        {
          provide: getRepositoryToken(Portfolio),
          useValue: mockPortfolioRepo,
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepo,
        },
      ],
    }).compile();

    service = module.get<PortfolioService>(PortfolioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserTransactions', () => {
    it('should correctly map buy and sell sides based on userId', async () => {
      const mockTransactions = [
        {
          id: 1,
          price: '50.00',
          quantity: 100,
          fee: '0.00',
          executedAt: new Date(),
          stock: { symbol: 'AAPL', name: 'Apple Inc' },
          buyOrder: { userId: 1 },
          sellOrder: { userId: 2 },
        },
        {
          id: 2,
          price: '150.00',
          quantity: 200,
          fee: '0.00',
          executedAt: new Date(),
          stock: { symbol: 'TSLA', name: 'Tesla Inc' },
          buyOrder: { userId: 3 },
          sellOrder: { userId: 1 },
        },
      ];

      mockTransactionRepo.find.mockResolvedValue(mockTransactions);

      const result = await service.getUserTransactions(1);
      
      expect(result.length).toBe(2);
      expect(result[0].side).toBe('BUY');
      expect(result[0].totalValue).toBe(5000); // 50 * 100
      expect(result[1].side).toBe('SELL');
      expect(result[1].totalValue).toBe(30000); // 150 * 200
    });
  });
});
