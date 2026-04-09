import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { StocksService } from '../stocks/stocks.service';
import { OrdersService } from '../orders/orders.service';
import { AdminStatisticsDto } from './dto/admin-statistics.dto';
import { UserStatus } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly stocksService: StocksService,
    private readonly ordersService: OrdersService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getStatistics(): Promise<AdminStatisticsDto> {
    const [
      totalUsers,
      activeUsers,
      lockedUsers,
      totalStocks,
      activeStocks,
      totalTradingVolume,
      totalFeesCollected,
      ordersToday,
    ] = await Promise.all([
      this.usersService.count(),
      this.userRepository.count({ where: { status: UserStatus.ACTIVE } }),
      this.userRepository.count({ where: { status: UserStatus.LOCKED } }),
      this.stocksService.count(),
      this.stocksService.countActive(),
      this.ordersService.getTotalTradingVolume(),
      this.ordersService.getTotalFees(),
      this.ordersService.countToday(),
    ]);

    return {
      totalUsers,
      activeUsers,
      lockedUsers,
      totalStocks,
      activeStocks,
      haltedStocks: totalStocks - activeStocks,
      totalTradingVolume,
      totalFeesCollected,
      ordersToday,
    };
  }

  async getUsers(page: number, limit: number, search?: string) {
    return this.usersService.findAll(page, limit, search);
  }

  async lockUser(id: number) {
    return this.usersService.lockUser(id);
  }

  async unlockUser(id: number) {
    return this.usersService.unlockUser(id);
  }

  async getStocks() {
    return this.stocksService.findAll();
  }

  async haltStock(id: number) {
    return this.stocksService.haltStock(id);
  }

  async resumeStock(id: number) {
    return this.stocksService.resumeStock(id);
  }

  async getOrders(page: number, limit: number, status?: string, side?: string, stockId?: number) {
    return this.ordersService.findAllOrders(page, limit, status, side, stockId);
  }

  async forceCancelOrder(id: number) {
    return this.ordersService.forceCancelOrder(id);
  }
}
