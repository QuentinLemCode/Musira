import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { jwtVerify } from 'jose';
import { UsersService } from '../users.service.js';
import { JwtService } from './jwt.service.js';

// Mocking the UsersService
const mockUsersService = {
  generateRefreshUUID: jest.fn(),
  findEmailUserById: jest.fn(),
};

enum IssuerType {
  GOOGLE,
  FACEBOOK,
  EMAIL,
}

describe('JwtService', () => {
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(jwtService).toBeDefined();
  });

  describe('jwtIssuer', () => {
    it('should correctly map Google issuer', () => {
      expect(jwtService['jwtIssuer']('https://accounts.google.com')).toBe(
        IssuerType.GOOGLE,
      );
    });

    it('should correctly map Facebook issuer', () => {
      expect(jwtService['jwtIssuer']('facebook')).toBe(IssuerType.FACEBOOK);
    });

    it('should correctly map Email issuer', () => {
      expect(jwtService['jwtIssuer']('email')).toBe(IssuerType.EMAIL);
    });

    it('should throw UnauthorizedException for unknown issuer', () => {
      expect(() => jwtService['jwtIssuer']('unknown')).toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', async () => {
      const userId = 123;
      const uuid = 'mocked-uuid';
      mockUsersService.generateRefreshUUID.mockResolvedValue(uuid);

      const refreshToken = await jwtService.generateRefreshToken(userId);

      expect(refreshToken).toBeDefined();
      expect(typeof refreshToken).toBe('string');

      const decoded = await jwtVerify(
        refreshToken,
        jwtService['refreshTokenSecret'],
      );
      expect(decoded.payload.id).toBe(uuid);
      expect(decoded.payload.userId).toBe(userId);
    });
  });
});
