import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import type { FastifyReply } from 'fastify';
import { EmailUser } from '../users/user.email.entity';
import { UserRole } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { hashPassword } from '../utils/hash';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let mockFastifyReply: FastifyReply;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            emailLogin: vi.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    mockFastifyReply = {
      clearCookie: vi.fn(),
      setCookie: vi.fn(),
    } as unknown as FastifyReply;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should log in user and set cookie', () => {
      const mockUser: EmailUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed_password', // Replace with actual hashed password
        name: 'Test User',
        role: UserRole.USER,
      } as EmailUser;
      const mockAccessToken = 'mock_access_token';
      vi.spyOn(usersService, 'emailLogin').mockResolvedValue(mockUser);
      vi.spyOn(jwtService, 'sign').mockReturnValue(mockAccessToken);

      const result = service.login(mockUser, mockFastifyReply);
      expect(mockFastifyReply.setCookie).toHaveBeenCalledWith(
        'signature',
        expect.any(String),
        {
          httpOnly: true,
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
          secure: true,
          sameSite: 'strict',
        },
      );
      expect(result).toEqual({ accessToken: mockAccessToken });
    });
  });

  describe('logout', () => {
    it('should clear cookie', () => {
      service.logout(mockFastifyReply);
      expect(mockFastifyReply.clearCookie).toHaveBeenCalledWith('signature');
    });
  });

  describe('validateUser', () => {
    it('should validate the user', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const mockUser: EmailUser = {
        id: 1,
        email,
        password: 'hashed_password', // Replace with actual hashed password
        name: 'Test User',
        role: UserRole.USER,
      } as EmailUser;
      vi.spyOn(usersService, 'emailLogin').mockResolvedValue(mockUser);
      vi.spyOn;

      const result = await service.validateUser(email, password);
      expect(result).toEqual(mockUser);
    });
  });

  describe('verifySignature', () => {
    it('should verify the signature', () => {
      const jwtId = 'some_jwt_id';
      const signature = hashPassword(jwtId, service['signatureSecret']);
      const result = service.verifySignature(jwtId, signature);
      expect(result).toBeTruthy();
    });

    it('should not verify incorrect signature', () => {
      const jwtId = 'some_jwt_id';
      const signature = 'incorrect_signature';
      const result = service.verifySignature(jwtId, signature);
      expect(result).toBeFalsy();
    });
  });
});
