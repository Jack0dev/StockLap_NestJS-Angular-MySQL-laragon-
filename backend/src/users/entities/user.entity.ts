import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ select: false })
  password: string;

  @Column({ default: false })
  is2FAEnabled: boolean;

  @Column({ nullable: true })
  otpSecret: string;
}
