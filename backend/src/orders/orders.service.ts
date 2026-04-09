import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async findAllOrders(
    page = 1,
    limit = 10,
    status?: string,
    side?: string,
    stockId?: number,
  ) {
    const query = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.stock', 'stock');

    if (status) {
      query.andWhere('order.status = :status', { status });
    }
    if (side) {
      query.andWhere('order.side = :side', { side });
    }
    if (stockId) {
      query.andWhere('order.stockId = :stockId', { stockId });
    }

    query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('order.createdAt', 'DESC');

    const [orders, total] = await query.getManyAndCount();
    return { orders, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async countToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.orderRepository
      .createQueryBuilder('order')
      .where('order.createdAt >= :today', { today })
      .getCount();
  }

  async forceCancelOrder(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException('Lệnh không tồn tại');
    }
    order.status = OrderStatus.CANCELLED;
    return this.orderRepository.save(order);
  }

  async getTotalTradingVolume(): Promise<number> {
    const result = await this.transactionRepository
      .createQueryBuilder('txn')
      .select('SUM(txn.price * txn.quantity)', 'totalVolume')
      .getRawOne();
    return result?.totalVolume || 0;
  }

  async getTotalFees(): Promise<number> {
    const result = await this.transactionRepository
      .createQueryBuilder('txn')
      .select('SUM(txn.fee)', 'totalFees')
      .getRawOne();
    return result?.totalFees || 0;
  }

  async save(order: Partial<Order>): Promise<Order> {
    return this.orderRepository.save(order);
  }

  async saveTransaction(txn: Partial<Transaction>): Promise<Transaction> {
    return this.transactionRepository.save(txn);
  }
}
