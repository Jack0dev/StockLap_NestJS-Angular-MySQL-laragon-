import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Stock } from '../../stocks/entities/stock.entity';

@Entity('portfolios')
@Unique(['userId', 'stockId'])
export class Portfolio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'stock_id' })
  stockId: number;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ name: 'locked_qty', type: 'int', default: 0 })
  lockedQty: number;

  @Column({ name: 'avg_buy_price', type: 'decimal', precision: 15, scale: 2, default: 0 })
  avgBuyPrice: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Stock)
  @JoinColumn({ name: 'stock_id' })
  stock: Stock;
}
