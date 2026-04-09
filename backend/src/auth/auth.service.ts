import { Injectable, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as qrcode from 'qrcode';
const { authenticator } = require('otplib');

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Verify2FaDto } from './dto/verify-2fa.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  
  // A simple in-memory mock for OTPs since we don't have Redis/SMTP setup
  private otpStorage = new Map<string, string>(); 

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersRepository.findOne({ where: { email: registerDto.email } });
    if (existingUser) {
      throw new BadRequestException('Email đã tồn tại trong hệ thống');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = this.usersRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      fullName: registerDto.fullName,
      status: UserStatus.LOCKED, // Pend verification
    });
    
    await this.usersRepository.save(user);

    // Generate Mock OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpStorage.set(user.email, otp);
    
    this.logger.warn(`[MOCK OTP] Email đăng ký: ${user.email} -> MÃ OTP LÀ: ${otp}`);

    return {
      message: 'Đăng ký thành công, vui lòng kiểm tra Terminal (Console) để lấy mã OTP',
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const storedOtp = this.otpStorage.get(verifyOtpDto.email);
    if (!storedOtp || storedOtp !== verifyOtpDto.otp) {
      throw new BadRequestException('Mã OTP không hợp lệ hoặc đã hết hạn');
    }

    const user = await this.usersRepository.findOne({ where: { email: verifyOtpDto.email } });
    if (!user) throw new BadRequestException('Tài khoản không tồn tại');

    user.status = UserStatus.ACTIVE;
    await this.usersRepository.save(user);
    this.otpStorage.delete(verifyOtpDto.email);

    return { message: 'Xác thực thành công. Bạn đã có thể đăng nhập.' };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findOne({ where: { email: loginDto.email } });
    if (!user) throw new UnauthorizedException('Sai tài khoản hoặc mật khẩu');

    if (user.status === UserStatus.LOCKED) {
      throw new UnauthorizedException('Tài khoản chưa được kích hoạt OTP hoặc đang bị khóa');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Sai tài khoản hoặc mật khẩu');

    if (user.is2FAEnabled) {
      // Create a temporary token for 2FA step
      const payload = { sub: user.id, temp: true };
      return {
        requires2fa: true,
        tempToken: this.jwtService.sign(payload, { expiresIn: '5m' }),
        message: 'Vui lòng nhập mã Google Authenticator',
      };
    }

    return this.generateAuthResponse(user);
  }

  async generate2FaSecret(userId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('Tài khoản không tồn tại');
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, 'StockLab', secret);
    
    user.otpSecret = secret;
    await this.usersRepository.save(user);

    const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);
    return { qrCodeUrl };
  }

  async turnOn2Fa(userId: number, verify2FaDto: Verify2FaDto) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('Tài khoản không tồn tại');
    const isCodeValid = authenticator.verify({
      token: verify2FaDto.token,
      secret: user.otpSecret,
    });

    if (!isCodeValid) throw new BadRequestException('Mã 2FA không chính xác');

    user.is2FAEnabled = true;
    await this.usersRepository.save(user);

    return { message: 'Đã bật bảo mật 2 lớp thành công' };
  }

  async verify2Fa(tempToken: string, verify2FaDto: Verify2FaDto) {
    try {
      const decoded = this.jwtService.verify(tempToken) as { sub: number; temp: boolean };
      if (!decoded.temp) throw new UnauthorizedException('Token không hợp lệ');

      const user = await this.usersRepository.findOne({ where: { id: decoded.sub } });
      if (!user) throw new BadRequestException('Tài khoản không tồn tại');
      const isCodeValid = authenticator.verify({
        token: verify2FaDto.token,
        secret: user.otpSecret,
      });

      if (!isCodeValid) throw new UnauthorizedException('Mã 2FA không chính xác');

      return this.generateAuthResponse(user);
    } catch (e) {
      throw new UnauthorizedException('Phiên xác thực đã hết hạn hoặc không hợp lệ');
    }
  }

  async forgotPassword(email: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) throw new BadRequestException('Tài khoản không tồn tại');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpStorage.set(email, otp);
    
    this.logger.warn(`[MOCK OTP] Email quên mật khẩu: ${email} -> MÃ OTP LÀ: ${otp}`);
    return { message: 'Đã gửi mã OTP. Vui lòng kiểm tra Terminal.' };
  }

  async resetPassword(resetDto: ResetPasswordDto) {
    const storedOtp = this.otpStorage.get(resetDto.email);
    if (!storedOtp || storedOtp !== resetDto.otp) {
      throw new BadRequestException('Mã OTP không hợp lệ');
    }

    const user = await this.usersRepository.findOne({ where: { email: resetDto.email } });
    if (!user) throw new BadRequestException('Tài khoản không tồn tại');

    user.password = await bcrypt.hash(resetDto.newPassword, 10);
    await this.usersRepository.save(user);
    this.otpStorage.delete(resetDto.email);

    return { message: 'Đặt lại mật khẩu thành công' };
  }

  private generateAuthResponse(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      }
    };
  }
}
