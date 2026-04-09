import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: Partial<Record<keyof AuthService, jest.Mock>>;

  beforeEach(async () => {
    authService = {
      register: jest.fn().mockResolvedValue({ message: 'Đăng ký thành công!' }),
      login: jest.fn().mockResolvedValue({ accessToken: 'mock.jwt.token' }),
      loginWith2FA: jest.fn().mockResolvedValue({ accessToken: 'mock.jwt.token' }),
      generateTwoFactorAuthSecret: jest.fn().mockResolvedValue({ qrCodeDataUrl: 'qr_data_url', secret: 'abc' }),
      turnOnTwoFactorAuthentication: jest.fn().mockResolvedValue({ message: '2FA đã được kích hoạt thành công.' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /auth/register', () => {
    it('should register user and return success message', async () => {
      const dto = { email: 'a@b.com', fullName: 'Test', password: 'pass123' };
      const result = await controller.register(dto as any);
      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result.message).toContain('thành công');
    });
  });

  describe('POST /auth/login', () => {
    it('should return access token on valid login', async () => {
      const dto = { email: 'a@b.com', password: 'pass123' };
      const result = await controller.login(dto as any);
      expect(result.accessToken).toBe('mock.jwt.token');
    });
  });

  describe('POST /auth/login/2fa/:userId', () => {
    it('should return access token after OTP verification', async () => {
      const result = await controller.loginWith2FA(1, '123456');
      expect(authService.loginWith2FA).toHaveBeenCalledWith(1, '123456');
      expect(result.accessToken).toBe('mock.jwt.token');
    });
  });

  describe('POST /auth/2fa/generate', () => {
    it('should return qrCodeDataUrl', async () => {
      const result = await controller.generateQR({ id: 1, email: 'a@b.com' } as any);
      expect(result.qrCodeDataUrl).toBe('qr_data_url');
    });
  });

  describe('POST /auth/2fa/turn-on', () => {
    it('should enable 2FA for user', async () => {
      const result = await controller.turnOn2FA(1, '123456');
      expect(authService.turnOnTwoFactorAuthentication).toHaveBeenCalledWith(1, '123456');
      expect(result.message).toContain('kích hoạt');
    });
  });
});
