import { Module } from '@nestjs/common';
import { BotsService } from './bots.service';
import { UsersModule } from '../users/users.module';
import { StocksModule } from '../stocks/stocks.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [UsersModule, StocksModule, OrdersModule],
  providers: [BotsService],
})
export class BotsModule {}
