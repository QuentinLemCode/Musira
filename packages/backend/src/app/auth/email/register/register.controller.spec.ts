import { EmailRegisterInterface } from '@musira/api';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { FastifyReply } from 'fastify';
import { UsersService } from '../../../users/users.service';
import { AuthService } from '../../auth.service';
import { RegisterController } from './register.controller';
describe('RegisterController', () => {
  let registerController: RegisterController;
  const usersService = { emailRegister: jest.fn() };
  const authService = { login: jest.fn() };
  let mockFastifyReply: FastifyReply;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegisterController],
      providers: [
        { provide: UsersService, useValue: usersService },
        { provide: AuthService, useValue: authService },
      ],
    }).compile();

    mockFastifyReply = {
      clearCookie: jest.fn(),
      setCookie: jest.fn(),
    } as unknown as FastifyReply;

    registerController = module.get<RegisterController>(RegisterController);
  });

  describe('create', () => {
    it('should create a new user and return an EmailUserResponseDTO with token', async () => {
      const date = new Date();
      const emailRegisterData: EmailRegisterInterface = {
        username: 'test',
        email: 'test@example.com',
        password: 'testPassword',
      };
      const createdUser = {
        name: 'test',
        id: 1,
        created_at: date,
        updated_at: date,
        role: 1,
        email: 'test@example.com',
        locked: false,
        loginTries: 0,
        /* Create a mock of the created user object */
      };
      const generatedToken = {
        accessToken: 'token',
      };

      usersService.emailRegister.mockResolvedValue(createdUser);
      authService.login.mockResolvedValue(generatedToken);

      const result = await registerController.create(
        emailRegisterData,
        mockFastifyReply,
      );

      expect(result).toHaveProperty('accessToken');
      expect(usersService.emailRegister).toHaveBeenCalledWith(
        emailRegisterData,
      );
      expect(authService.login).toHaveBeenCalledWith(
        createdUser,
        mockFastifyReply,
      );
    });

    it('should throw BadRequestException when user already exists', async () => {
      const emailRegisterData: EmailRegisterInterface = {
        username: 'ExistingUser',
        email: 'existing@example.com',
        password: 'existingPassword',
      };
      usersService.emailRegister.mockResolvedValue(null);

      await expect(
        registerController.create(emailRegisterData, mockFastifyReply),
      ).rejects.toThrow(BadRequestException);
      expect(usersService.emailRegister).toHaveBeenCalledWith(
        emailRegisterData,
      );
    });
  });
});
