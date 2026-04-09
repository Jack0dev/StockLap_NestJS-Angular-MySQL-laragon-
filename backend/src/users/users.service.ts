import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(page = 1, limit = 10, search?: string) {
    const query = this.userRepository.createQueryBuilder('user');

    if (search) {
      query.where('user.email LIKE :search OR user.fullName LIKE :search', {
        search: `%${search}%`,
      });
    }

    query
      .select([
        'user.id',
        'user.email',
        'user.fullName',
        'user.role',
        'user.status',
        'user.balance',
        'user.is2FAEnabled',
        'user.createdAt',
      ])
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('user.createdAt', 'DESC');

    const [users, total] = await query.getManyAndCount();
    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async count(): Promise<number> {
    return this.userRepository.count();
  }

  async lockUser(id: number): Promise<User> {
    await this.userRepository.update(id, { status: UserStatus.LOCKED });
    return this.userRepository.findOneOrFail({ where: { id } });
  }

  async unlockUser(id: number): Promise<User> {
    await this.userRepository.update(id, { status: UserStatus.ACTIVE });
    return this.userRepository.findOneOrFail({ where: { id } });
  }

  async save(user: Partial<User>): Promise<User> {
    return this.userRepository.save(user);
  }
}
