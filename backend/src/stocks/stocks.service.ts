import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from './entities/stock.entity';

@Injectable()
export class StocksService {
  constructor(
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
  ) {}

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
