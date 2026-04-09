import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Stock } from './stock.entity';

@Entity('stock_price_history')
@Index(['stockId', 'timestamp'], { unique: true })
export class StockPriceHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'stock_id' })
  stockId: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  open: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  high: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  low: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  close: number;

  @Column({ type: 'bigint' })
  volume: number;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @ManyToOne(() => Stock)
  @JoinColumn({ name: 'stock_id' })
  stock: Stock;
}
