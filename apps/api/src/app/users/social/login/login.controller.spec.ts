import {
  SocialLoginUserDTO,
  SocialUserResponseDTO,
} from '@musira/api-interfaces/index';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../users.service';
import { LoginController } from './login.controller';

// Mocking Services
const mockUsersService = {
  socialLogin: jest.fn(),
};

describe('LoginController', () => {
  let controller: LoginController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoginController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<LoginController>(LoginController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should log in social user and return user response', async () => {
      const user = {
        name: 'testuser',
        id: 1,
        created_at: new Date(),
        updated_at: new Date(),
        sessionCreated: Promise.resolve([]),
        role: 0,
        provider: 'google',
      };
      const socialUserDTO: SocialLoginUserDTO = {
        email: 'test@example.com',
        name: 'testuser',
        photoUrl: 'https://example.com/photo.jpg',
        provider: 'google',
        firstName: 'toto',
        lastName: 'toto',
        isValid: () => 'true',
      };
      mockUsersService.socialLogin.mockResolvedValue(user);

      const result = await controller.login(socialUserDTO);

      expect(result).toEqual(
        new SocialUserResponseDTO(
          user.name,
          user.id,
          user.created_at.toISOString(),
          user.updated_at.toISOString(),
          [],
          0,
          user.role,
          user.provider,
          'SOCIAL',
        ),
      );
    });

    it('should throw BadRequestException for invalid social user', async () => {
      const invalidSocialUser = {
        email: 'test@example.com',
        name: 'testuser',
        // Missing 'provider' property
      } as SocialLoginUserDTO;
      mockUsersService.socialLogin.mockResolvedValue(null);

      await expect(controller.login(invalidSocialUser)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
