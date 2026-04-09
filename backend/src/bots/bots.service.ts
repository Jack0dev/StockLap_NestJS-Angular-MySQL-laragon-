import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UsersService } from '../users/users.service';
import { StocksService } from '../stocks/stocks.service';
import { OrdersService } from '../orders/orders.service';
import { UserRole, UserStatus, User } from '../users/entities/user.entity';
import { OrderSide, OrderType, OrderStatus } from '../orders/entities/order.entity';
import * as bcrypt from 'bcrypt';

const NUM_BOTS = 5;

@Injectable()
export class BotsService implements OnModuleInit {
  private readonly logger = new Logger(BotsService.name);
  private botUsers: User[] = [];

  constructor(
    private readonly usersService: UsersService,
    private readonly stocksService: StocksService,
    private readonly ordersService: OrdersService,
  ) {}

  async onModuleInit() {
    await this.seedBots();
  }

  private async seedBots() {
    this.logger.log('Checking and seeding bot accounts...');
    const defaultPassword = await bcrypt.hash('botpassword123', 10);

    for (let i = 1; i <= NUM_BOTS; i++) {
      const email = `bot_${i}@stocklab.local`;
      let user = await this.usersService.findByEmail(email);

      if (!user) {
        user = await this.usersService.save({
          email,
          password: defaultPassword,
          fullName: `Liquidity Bot ${i}`,
          role: UserRole.USER,
          status: UserStatus.ACTIVE,
          balance: 1000000000, // 1 Billion VND
        });
        this.logger.log(`Created bot account: ${email}`);
      }
      this.botUsers.push(user);
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleRandomTrades() {
    if (this.botUsers.length === 0) return;

    try {
      const stocksResult = await this.stocksService.findAll();
      const activeStocks = stocksResult.filter((s) => !s.isHalted);
      
      if (activeStocks.length === 0) return;

      const randomBot = this.botUsers[Math.floor(Math.random() * this.botUsers.length)];
      const ordersToPlace = Math.floor(Math.random() * 3) + 1; // 1 to 3 orders

      for (let i = 0; i < ordersToPlace; i++) {
        const randomStock = activeStocks[Math.floor(Math.random() * activeStocks.length)];
        const isBuy = Math.random() > 0.5;
        
        const currentPrice = Number(randomStock.currentPrice);
        const fluctuation = currentPrice * 0.02;
        const randomSign = Math.random() > 0.5 ? 1 : -1;
        const targetPrice = currentPrice + (Math.random() * fluctuation * randomSign);
        
        const quantity = Math.floor(Math.random() * 900) + 100;

        await this.ordersService.save({
          userId: randomBot.id,
          stockId: randomStock.id,
          side: isBuy ? OrderSide.BUY : OrderSide.SELL,
          orderType: OrderType.LIMIT,
          price: Number(targetPrice.toFixed(2)),
          quantity,
          filledQty: 0,
          status: OrderStatus.PENDING,
        });

        this.logger.log(`Bot ${randomBot.fullName} placed ${isBuy ? 'BUY' : 'SELL'} LIMIT for ${randomStock.symbol}: ${quantity} @ ${targetPrice.toFixed(2)}`);
      }
    } catch (error) {
      this.logger.error('Error generating random trades', error);
    }
  }
}
