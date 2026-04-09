import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Transaction } from './entities/transaction.entity';
import { OrdersService } from './orders.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Transaction])],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
