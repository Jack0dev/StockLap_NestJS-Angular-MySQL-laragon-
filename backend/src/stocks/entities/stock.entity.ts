import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('stocks')
export class Stock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 10 })
  symbol: string;

  @Column()
  name: string;

  @Column({ name: 'current_price', type: 'decimal', precision: 15, scale: 2, default: 0 })
  currentPrice: number;

  @Column({ name: 'previous_close', type: 'decimal', precision: 15, scale: 2, default: 0 })
  previousClose: number;

  @Column({ name: 'change_percent', type: 'decimal', precision: 8, scale: 2, default: 0 })
  changePercent: number;

  @Column({ name: 'is_halted', default: false })
  isHalted: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
