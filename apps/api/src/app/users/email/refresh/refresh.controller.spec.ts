import { Test, TestingModule } from '@nestjs/testing';
import { RefreshController } from './refresh.controller';
import { JwtService } from '../../../users/jwt/jwt.service';
import { EmailRefreshResponseDTO } from '@musira/api-interfaces/index';
import { BadRequestException } from '@nestjs/common';

// Mocking Services
const mockJwtService = {
  createAccessTokenFromRefreshToken: jest.fn(),
};

describe('RefreshController', () => {
  let controller: RefreshController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RefreshController],
      providers: [{ provide: JwtService, useValue: mockJwtService }],
    }).compile();

    controller = module.get<RefreshController>(RefreshController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('refresh', () => {
    it('should refresh tokens', async () => {
      const accessToken = 'fakeAccessToken';
      const refreshToken = 'fakeRefreshToken';
      const expiresAt = 1234567890;
      const refreshResponse = {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAt,
      };
      mockJwtService.createAccessTokenFromRefreshToken.mockResolvedValue(
        refreshResponse,
      );

      const result = await controller.refresh({ token: 'fakeToken' });

      expect(result).toEqual(
        new EmailRefreshResponseDTO(accessToken, refreshToken, expiresAt),
      );
    });

    it('should throw BadRequestException if no token provided', async () => {
      const requestBody = { token: '' };
      await expect(controller.refresh(requestBody)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
