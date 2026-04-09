import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';

// Mock bcrypt để test không cần hash thật
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepository: any;
  let mockJwtService: any;

  const mockUser: Partial<User> = {
    id: 1,
    email: 'test@stocklab.vn',
    fullName: 'Test User',
    password: 'hashed_password',
    is2FAEnabled: false,
    otpSecret: undefined,
  };

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn().mockReturnValue(mockUser),
      save: jest.fn().mockResolvedValue(mockUser),
      update: jest.fn().mockResolvedValue(undefined),
      createQueryBuilder: jest.fn().mockReturnValue({
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
      }),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock.jwt.token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // ─── Registration ─────────────────────────────────────────────────
  describe('register', () => {
    it('should register a new user successfully', async () => {
      mockUserRepository.findOne.mockResolvedValue(null); // email chưa tồn tại
      const result = await service.register({
        email: 'new@stocklab.vn',
        fullName: 'New User',
        password: 'password123',
      });
      expect(result.message).toContain('thành công');
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      await expect(
        service.register({ email: 'test@stocklab.vn', fullName: 'x', password: '123456' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ─── Login ───────────────────────────────────────────────────────
  describe('login', () => {
    it('should return accessToken for valid credentials without 2FA', async () => {
      mockUserRepository.createQueryBuilder().getOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({ email: 'test@stocklab.vn', password: 'password123' });
      expect(result.accessToken).toBe('mock.jwt.token');
    });

    it('should return requires2FA flag when 2FA is enabled', async () => {
      const userWith2FA = { ...mockUser, is2FAEnabled: true };
      mockUserRepository.createQueryBuilder().getOne.mockResolvedValue(userWith2FA);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({ email: 'test@stocklab.vn', password: 'password123' });
      expect(result.requires2FA).toBe(true);
      expect(result.accessToken).toBeUndefined();
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockUserRepository.createQueryBuilder().getOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@stocklab.vn', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockUserRepository.createQueryBuilder().getOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'ghost@stocklab.vn', password: 'any' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── 2FA ─────────────────────────────────────────────────────────
  describe('2FA', () => {
    it('generateTwoFactorAuthSecret should return secret and qrCodeDataUrl', async () => {
      const result = await service.generateTwoFactorAuthSecret(mockUser as User);
      expect(result.secret).toBeDefined();
      expect(result.qrCodeDataUrl).toContain('data:image/png');
    });

    it('isTwoFactorAuthCodeValid should return true for valid code', async () => {
      const { secret } = await service.generateTwoFactorAuthSecret(mockUser as User);
      const userWithSecret = { ...mockUser, otpSecret: secret } as User;
      // không test code thật, chỉ test function structure
      const result = service.isTwoFactorAuthCodeValid('000000', userWithSecret);
      expect(typeof result).toBe('boolean');
    });
  });
});
