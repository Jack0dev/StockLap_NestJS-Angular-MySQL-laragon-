import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Stock } from '../../stocks/entities/stock.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'buy_order_id' })
  buyOrderId: number;

  @Column({ name: 'sell_order_id' })
  sellOrderId: number;

  @Column({ name: 'stock_id' })
  stockId: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  fee: number;

  @CreateDateColumn({ name: 'executed_at' })
  executedAt: Date;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'buy_order_id' })
  buyOrder: Order;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'sell_order_id' })
  sellOrder: Order;

  @ManyToOne(() => Stock)
  @JoinColumn({ name: 'stock_id' })
  stock: Stock;
}
