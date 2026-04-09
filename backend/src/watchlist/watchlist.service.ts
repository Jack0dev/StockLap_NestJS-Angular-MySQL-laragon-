import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Watchlist } from './entities/watchlist.entity';

@Injectable()
export class WatchlistService {
  constructor(
    @InjectRepository(Watchlist)
    private readonly watchlistRepository: Repository<Watchlist>,
  ) {}

  async getUserWatchlist(userId: number): Promise<Watchlist[]> {
    return this.watchlistRepository.find({
      where: { userId },
      relations: ['stock'],
      order: { createdAt: 'DESC' },
    });
  }

  async addStock(userId: number, stockId: number): Promise<Watchlist> {
    const existing = await this.watchlistRepository.findOne({ where: { userId, stockId } });
    if (existing) {
      throw new ConflictException('Cổ phiếu này đã có trong Watchlist');
    }
    const watchlistItem = this.watchlistRepository.create({ userId, stockId });
    return this.watchlistRepository.save(watchlistItem);
  }

  async removeStock(userId: number, stockId: number): Promise<void> {
    const result = await this.watchlistRepository.delete({ userId, stockId });
    if (result.affected === 0) {
      throw new NotFoundException('Không tìm thấy cổ phiếu trong Watchlist');
    }
  }
}
