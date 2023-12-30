import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { mockJwtGuard } from '../../test-utils/mock';
import { JwtGuard } from '../auth/jwt.guard';
import { JwtUser } from '@musira/api-interfaces';

// Mocking UsersService
const mockUsersService = {
  getAll: vi.fn(),
  delete: vi.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    })
      .overrideGuard(JwtGuard)
      .useValue(mockJwtGuard)
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('should return an array of users', async () => {
      const users: User[] = []; // Provide mock users
      mockUsersService.getAll.mockResolvedValue(users);

      const result = await controller.getAll();

      expect(result).toEqual(expect.any(Array));
      expect(result.length).toBe(users.length);
    });
  });

  describe('delete', () => {
    it('should delete himself', async () => {
      const userId = '123';
      mockUsersService.delete.mockResolvedValue(undefined);
      mockUsersService.getAll.mockResolvedValue([]);
      const request = {
        user: {
          id: 123,
          admin: false,
        } as JwtUser,
      };

      await controller.delete(userId, request);

      expect(mockUsersService.delete).toHaveBeenCalledWith(+userId);
    });

    it('should throw NotFoundException for non-existing user', async () => {
      const userId = '456';
      mockUsersService.delete.mockRejectedValue(new NotFoundException());
      const request = {
        user: {
          id: 123,
          admin: true,
        } as JwtUser,
      };

      await expect(controller.delete(userId, request)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should not allow deleting another user', async () => {
      const userId = '123';
      mockUsersService.delete.mockResolvedValue(undefined);
      mockUsersService.getAll.mockResolvedValue([]);
      const request = {
        user: {
          id: 1,
          admin: false,
        } as JwtUser,
      };

      await expect(controller.delete(userId, request)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow deleting another user as admin', async () => {
      const userId = '123';
      mockUsersService.delete.mockResolvedValue(undefined);
      mockUsersService.getAll.mockResolvedValue([]);
      const request = {
        user: {
          id: 1,
          admin: true,
        } as JwtUser,
      };

      await controller.delete(userId, request);

      expect(mockUsersService.delete).toHaveBeenCalledWith(+userId);
    });

    it('should not allow an admin to delete himself', async () => {
      const userId = '123';
      mockUsersService.delete.mockResolvedValue(undefined);
      mockUsersService.getAll.mockResolvedValue([]);
      const request = {
        user: {
          id: 123,
          admin: true,
        } as JwtUser,
      };

      await expect(controller.delete(userId, request)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
