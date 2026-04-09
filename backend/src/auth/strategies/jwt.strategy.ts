import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'defaultSecret',
    });
  }

  async validate(payload: any) {
    if (payload.temp) {
      // Temporary token for 2FA validation only, cannot access standard routes
      throw new UnauthorizedException('Truy cập bị từ chối. Vui lòng hoàn thành xác thực 2FA.');
    }
    const user = await this.usersRepository.findOne({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('Người dùng không còn tồn tại');
    return { id: user.id, email: user.email, role: user.role };
  }
}
