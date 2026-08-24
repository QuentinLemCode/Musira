import { Test, TestingModule } from '@nestjs/testing';
import type { FastifyReply } from 'fastify';
import { EmailUser } from '../../../users/user.email.entity';
import { AuthService } from '../../auth.service';
import { LoginController } from './login.controller';

describe('LoginController', () => {
  let controller: LoginController;
  const authService = { login: jest.fn() };
  let mockFastifyReply: FastifyReply;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoginController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    mockFastifyReply = {
      clearCookie: jest.fn(),
      setCookie: jest.fn(),
    } as unknown as FastifyReply;

    controller = module.get<LoginController>(LoginController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call login', async () => {
    const user: EmailUser = {
      email: 'toto',
      id: 1,
    } as unknown as EmailUser;
    controller.login(
      { email: user.email, password: 'pw' },
      { user },
      mockFastifyReply,
    );
    expect(authService.login).toHaveBeenCalled();
  });
});
