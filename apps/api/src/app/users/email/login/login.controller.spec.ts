import { EmailUserResponseDTO } from '#api-interfaces/index.js';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '../../jwt/jwt.service.js';
import { UsersService } from '../../users.service.js';
import { LoginController } from './login.controller.js';

// Mocking Services
const mockUsersService = {
  emailLogin: jest.fn(),
};

const mockJwtService = {
  generateEmailToken: jest.fn(),
};

describe('LoginController', () => {
  let controller: LoginController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoginController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    controller = module.get<LoginController>(LoginController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should log in user and return user response with token', async () => {
      const user = {
        name: 'testuser',
        id: 1,
        created_at: new Date(),
        updated_at: new Date(),
        sessionCreated: Promise.resolve([]),
        role: 1,
        email: 'test@example.com',
        locked: false,
        loginTries: 0,
      };
      const accessToken = 'fakeAccessToken';
      const refreshToken = 'fakeRefreshToken';
      const expiresAt = 1234567890;
      const tokenResponse = {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAt,
      };
      mockUsersService.emailLogin.mockResolvedValue(user);
      mockJwtService.generateEmailToken.mockResolvedValue(tokenResponse);

      const result = await controller.create({
        email: 'test@example.com',
        password: 'password',
      });

      expect(result).toEqual(
        new EmailUserResponseDTO(
          user.name,
          user.id,
          user.created_at.toISOString(),
          user.updated_at.toISOString(),
          [],
          tokenResponse.expires_at,
          user.role,
          user.email,
          tokenResponse.access_token,
          tokenResponse.refresh_token,
          user.locked,
          user.loginTries,
        ),
      );
    });

    it('should throw NotFoundException if user login fails', async () => {
      mockUsersService.emailLogin.mockResolvedValue(null);

      await expect(
        controller.create({ email: 'test@example.com', password: 'password' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
