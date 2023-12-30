import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../../users/users.service';
import { LogoutController } from './logout.controller';
import { AuthService } from '../../auth.service';
import type { FastifyReply } from 'fastify';

// Mocking Service
const mockUserService = {
  removeRefreshUUID: vi.fn(),
};

describe('LogoutController', () => {
  let controller: LogoutController;
  const authService = { logout: vi.fn() };
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
      clearCookie: vi.fn(),
      setCookie: vi.fn(),
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
