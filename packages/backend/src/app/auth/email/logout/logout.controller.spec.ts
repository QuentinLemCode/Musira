import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { FastifyReply } from 'fastify';
import { UsersService } from '../../../users/users.service';
import { AuthService } from '../../auth.service';
import { LogoutController } from './logout.controller';

// Mocking Service
const mockUserService = {
  removeRefreshUUID: jest.fn(),
};

describe('LogoutController', () => {
  let controller: LogoutController;
  const authService = { logout: jest.fn() };
  let mockFastifyReply: FastifyReply;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogoutController],
      providers: [
        { provide: UsersService, useValue: mockUserService },
        { provide: AuthService, useValue: authService },
      ],
    }).compile();

    controller = module.get<LogoutController>(LogoutController);
    mockFastifyReply = {
      clearCookie: jest.fn(),
      setCookie: jest.fn(),
    } as unknown as FastifyReply;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('logout', () => {
    it('should remove refresh UUID and return success message', async () => {
      const userId = '123';
      mockUserService.removeRefreshUUID.mockResolvedValue(true);

      await controller.logout(userId, mockFastifyReply);

      expect(mockUserService.removeRefreshUUID).toHaveBeenCalledWith(123);
    });

    it('should throw BadRequestException when id is missing', async () => {
      const userId = '';

      await expect(controller.logout(userId, mockFastifyReply)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
