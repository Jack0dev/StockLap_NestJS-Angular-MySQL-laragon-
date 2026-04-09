import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from './entities/stock.entity';
import { StockPriceHistory } from './entities/stock-price-history.entity';

@Injectable()
export class StocksService implements OnModuleInit {
  private readonly logger = new Logger(StocksService.name);

  constructor(
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
    @InjectRepository(StockPriceHistory)
    private readonly historyRepository: Repository<StockPriceHistory>,
  ) {}

  async onModuleInit() {
    await this.seedHistory();
  }

  private async seedHistory() {
    const historyCount = await this.historyRepository.count();
    if (historyCount > 0) return;

    this.logger.log('Seeding 30 days of candlestick history for all stocks...');
    const stocks = await this.findAll();
    
    const now = new Date();
    
    for (const stock of stocks) {
      let currentClose = Number(stock.currentPrice) || 50000;
      const historyToSave: StockPriceHistory[] = [];

      for (let i = 30; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const fluctuation = currentClose * 0.05; // 5% max fluctuation daily
        const open = currentClose;
        const close = open + (Math.random() * fluctuation * (Math.random() > 0.5 ? 1 : -1));
        const high = Math.max(open, close) + (Math.random() * fluctuation * 0.5);
        const low = Math.min(open, close) - (Math.random() * fluctuation * 0.5);
        const volume = Math.floor(Math.random() * 10000) + 1000;

        const historyRecord = this.historyRepository.create({
          stockId: stock.id,
          open: Number(open.toFixed(2)),
          high: Number(high.toFixed(2)),
          low: Number(low.toFixed(2)),
          close: Number(close.toFixed(2)),
          volume,
          timestamp: date,
        });

        historyToSave.push(historyRecord);
        currentClose = close;
      }
      
      await this.historyRepository.save(historyToSave);
      
      // Update the current price of stock to match the latest history
      await this.stockRepository.update(stock.id, { 
        currentPrice: currentClose,
        previousClose: historyToSave[historyToSave.length - 2].close
      });
    }
    
    this.logger.log('Finished seeding candlestick history.');
  }

  async getHistory(stockId: number): Promise<StockPriceHistory[]> {
    return this.historyRepository.find({
      where: { stockId },
      order: { timestamp: 'ASC' },
    });
  }

  async findAll(): Promise<Stock[]> {
    return this.stockRepository.find({ order: { symbol: 'ASC' } });
  }

  async findById(id: number): Promise<Stock | null> {
    return this.stockRepository.findOne({ where: { id } });
  }

  async count(): Promise<number> {
    return this.stockRepository.count();
  }

  async countActive(): Promise<number> {
    return this.stockRepository.count({ where: { isHalted: false } });
  }

  async haltStock(id: number): Promise<Stock> {
    await this.stockRepository.update(id, { isHalted: true });
    return this.stockRepository.findOneOrFail({ where: { id } });
  }

  async resumeStock(id: number): Promise<Stock> {
    await this.stockRepository.update(id, { isHalted: false });
    return this.stockRepository.findOneOrFail({ where: { id } });
  }

  async save(stock: Partial<Stock>): Promise<Stock> {
    return this.stockRepository.save(stock);
  }
}
