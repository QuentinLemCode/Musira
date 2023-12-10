import { EmailUserResponseDTO } from '@musira/api-interfaces/index';
import { EmailRegisterInterface } from '@musira/api-interfaces/user/email.dto';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '../../../users/jwt/jwt.service';
import { UsersService } from '../../../users/users.service';
import { RegisterController } from './register.controller';

describe('RegisterController', () => {
  let registerController: RegisterController;
  const usersService = { emailRegister: jest.fn() };
  const jwtService = { generateEmailToken: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegisterController],
      providers: [
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

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
        expires_at: 1000,
        access_token: 'token',
        refresh_token: 'refresh-token',
      };
      const expectedResponse: EmailUserResponseDTO = {
        name: 'test',
        created_at: date.toISOString(),
        email: 'test@example.com',
        expiresAt: 1000,
        id: 1,
        locked: false,
        loginTries: 0,
        refreshToken: 'refresh-token',
        role: 1,
        sessionCreatedIds: [],
        token: 'token',
        updated_at: date.toISOString(),
        type: 'EMAIL',
      };

      usersService.emailRegister.mockResolvedValue(createdUser);
      jwtService.generateEmailToken.mockResolvedValue(generatedToken);

      const result: EmailUserResponseDTO =
        await registerController.create(emailRegisterData);

      expect(result).toEqual(expectedResponse);
      expect(usersService.emailRegister).toHaveBeenCalledWith(
        emailRegisterData,
      );
      expect(jwtService.generateEmailToken).toHaveBeenCalledWith(createdUser);
    });

    it('should throw BadRequestException when user already exists', async () => {
      const emailRegisterData: EmailRegisterInterface = {
        username: 'ExistingUser',
        email: 'existing@example.com',
        password: 'existingPassword',
      };
      usersService.emailRegister.mockResolvedValue(null);

      await expect(
        registerController.create(emailRegisterData),
      ).rejects.toThrow(BadRequestException);
      expect(usersService.emailRegister).toHaveBeenCalledWith(
        emailRegisterData,
      );
    });
  });
});
