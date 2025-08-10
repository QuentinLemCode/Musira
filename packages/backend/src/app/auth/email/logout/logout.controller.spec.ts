import { Test, TestingModule } from '@nestjs/testing';
import type { FastifyReply } from 'fastify';
import { AuthService } from '../../auth.service';
import { LogoutController } from './logout.controller';

describe('LogoutController', () => {
  let controller: LogoutController;
  const authService = { logout: jest.fn() };
  let mockFastifyReply: FastifyReply;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogoutController],
      providers: [{ provide: AuthService, useValue: authService }],
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
    it('should call authService.logout', async () => {
      await controller.logout(mockFastifyReply);
      expect(authService.logout).toHaveBeenCalledWith(mockFastifyReply);
    });
  });
});
