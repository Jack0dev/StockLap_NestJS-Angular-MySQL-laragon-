import { Body, Controller, Post, Param, ParseIntPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ─── Registration & Login ─────────────────────────────────────────
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('login/2fa/:userId')
  loginWith2FA(
    @Param('userId', ParseIntPipe) userId: number,
    @Body('code') code: string,
  ) {
    return this.authService.loginWith2FA(userId, code);
  }

  // ─── 2FA Management ───────────────────────────────────────────────
  @Post('2fa/generate')
  generateQR(@Body() user: User) {
    return this.authService.generateTwoFactorAuthSecret(user);
  }

  @Post('2fa/turn-on')
  turnOn2FA(
    @Body('userId') userId: number,
    @Body('code') code: string,
  ) {
    return this.authService.turnOnTwoFactorAuthentication(userId, code);
  }
}
