import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Portfolio } from './entities/portfolio.entity';
import { Transaction } from '../orders/entities/transaction.entity';

@Injectable()
export class PortfolioService {
  private readonly logger = new Logger(PortfolioService.name);

  constructor(
    @InjectRepository(Portfolio)
    private readonly portfolioRepository: Repository<Portfolio>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async getUserPortfolio(userId: number): Promise<Portfolio[]> {
    this.logger.log(`Fetching active portfolio for user ${userId}`);
    return this.portfolioRepository.find({
      where: { userId, quantity: () => '> 0' }, // also fetch quantity > 0 OR lockedQty > 0
    });
  }

  async getUserTransactions(userId: number) {
    this.logger.log(`Fetching transaction history for user ${userId}`);
    const transactions = await this.transactionRepository.find({
      where: [
        { buyOrder: { userId } },
        { sellOrder: { userId } }
      ],
      relations: ['buyOrder', 'sellOrder', 'stock'],
      order: { executedAt: 'DESC' },
    });

    return transactions.map((t) => {
      const isBuyer = t.buyOrder?.userId === userId;
      return {
        id: t.id,
        stockSymbol: t.stock?.symbol,
        stockName: t.stock?.name,
        price: Number(t.price),
        quantity: t.quantity,
        side: isBuyer ? 'BUY' : 'SELL',
        totalValue: Number(t.price) * t.quantity,
        fee: Number(t.fee),
        executedAt: t.executedAt,
      };
    });
  }
}
