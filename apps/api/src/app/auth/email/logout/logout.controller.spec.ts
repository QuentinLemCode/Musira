import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../../users/users.service';
import { LogoutController } from './logout.controller';

// Mocking Service
const mockUserService = {
  removeRefreshUUID: jest.fn(),
};

describe('LogoutController', () => {
  let controller: LogoutController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogoutController],
      providers: [{ provide: UsersService, useValue: mockUserService }],
    }).compile();

    controller = module.get<LogoutController>(LogoutController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('logout', () => {
    it('should remove refresh UUID and return success message', async () => {
      const userId = '123';
      mockUserService.removeRefreshUUID.mockResolvedValue(true);

      const result = await controller.logout(userId);

      expect(result).toBe(true);
      expect(mockUserService.removeRefreshUUID).toHaveBeenCalledWith(123);
    });

    it('should throw BadRequestException when id is missing', async () => {
      const userId = '';

      await expect(controller.logout(userId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
