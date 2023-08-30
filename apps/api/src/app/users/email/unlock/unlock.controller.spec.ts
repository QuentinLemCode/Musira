import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UnlockController } from './unlock.controller';
import { UsersService } from '../../users.service';
import { mockJwtGuard } from '../../../../test-utils/mock';
import { RolesGuard } from '../../roles.guard';
import { JwtGuard } from '../../jwt/jwt.guard';

describe('UnlockController', () => {
  let controller: UnlockController;
  const mockUser = {
    unlock: jest.fn(),
    getAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnlockController],
      providers: [{ provide: UsersService, useValue: mockUser }],
    })
      .overrideGuard(JwtGuard)
      .useValue(mockJwtGuard)
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UnlockController>(UnlockController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('unlock', () => {
    it('should unlock a user', async () => {
      const userId = '123';
      mockUser.unlock.mockResolvedValue(undefined);
      mockUser.getAll.mockResolvedValue([]);

      const result = await controller.unlock(userId);

      expect(result).toEqual(expect.any(Array));
    });
  });
});
