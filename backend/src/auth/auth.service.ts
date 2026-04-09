import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as qrcode from 'qrcode';
import { authenticator } from 'otplib';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // ─── Registration ────────────────────────────────────────────────
  async register(dto: RegisterDto): Promise<{ message: string }> {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email này đã được sử dụng.');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      email: dto.email,
      fullName: dto.fullName,
      password: hashedPassword,
    });
    await this.userRepository.save(user);
    return { message: 'Đăng ký thành công! Vui lòng đăng nhập.' };
  }

  // ─── Login (Step 1) ──────────────────────────────────────────────
  async login(dto: LoginDto): Promise<{ accessToken?: string; requires2FA?: boolean; userId?: number }> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email: dto.email })
      .getOne();

    if (!user) throw new UnauthorizedException('Email hoặc mật khẩu không đúng.');

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Email hoặc mật khẩu không đúng.');

    // Nếu đã bật 2FA → yêu cầu bước xác thực OTP
    if (user.is2FAEnabled) {
      return { requires2FA: true, userId: user.id };
    }

    // Không có 2FA → cấp JWT ngay
    const payload = { sub: user.id, email: user.email };
    return { accessToken: this.jwtService.sign(payload) };
  }

  // ─── Login Step 2: Verify 2FA OTP ───────────────────────────────
  async loginWith2FA(userId: number, code: string): Promise<{ accessToken: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.is2FAEnabled || !user.otpSecret) {
      throw new UnauthorizedException('Xác thực 2FA không hợp lệ.');
    }

    const isValid = authenticator.verify({ token: code, secret: user.otpSecret });
    if (!isValid) throw new UnauthorizedException('Mã OTP không chính xác.');

    const payload = { sub: user.id, email: user.email };
    return { accessToken: this.jwtService.sign(payload) };
  }

  // ─── 2FA Setup ───────────────────────────────────────────────────
  async generateTwoFactorAuthSecret(user: User) {
    const secret = authenticator.generateSecret();
    const appName = 'StockLab';
    const otpAuthUrl = authenticator.keyuri(user.email, appName, secret);

    await this.userRepository.update(user.id, { otpSecret: secret });
    const qrCodeDataUrl = await qrcode.toDataURL(otpAuthUrl);
    return { secret, qrCodeDataUrl };
  }

  async turnOnTwoFactorAuthentication(userId: number, code: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.otpSecret) throw new UnauthorizedException('Chưa thiết lập 2FA.');

    const isValid = authenticator.verify({ token: code, secret: user.otpSecret });
    if (!isValid) throw new UnauthorizedException('Mã OTP không chính xác.');

    await this.userRepository.update(userId, { is2FAEnabled: true });
    return { message: '2FA đã được kích hoạt thành công.' };
  }

  isTwoFactorAuthCodeValid(code: string, user: User): boolean {
    return authenticator.verify({ token: code, secret: user.otpSecret });
  }
}
