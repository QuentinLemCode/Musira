import { OAuthProvider } from '@musira/api-interfaces/index';
import { Test, TestingModule } from '@nestjs/testing';
import { FastifyReply } from 'fastify';
import { OAuthUser } from '../../users/user.oauth.entity';
import { AuthService } from '../auth.service';
import { OauthController } from './oauth.controller';
import { OAuthService } from './oauth.service';

describe('OauthController', () => {
  let controller: OauthController;
  let oauthService: OAuthService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OauthController],
      providers: [
        {
          provide: OAuthService,
          useValue: {
            login: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OauthController>(OauthController);
    oauthService = module.get<OAuthService>(OAuthService);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call OAuthService.login and AuthService.login', async () => {
      const provider = OAuthProvider.FACEBOOK;
      const code = 'valid_oauth_code';
      const mockUser = {};
      const mockRes = {} as FastifyReply;

      jest
        .spyOn(oauthService, 'login')
        .mockResolvedValue(mockUser as OAuthUser);
      jest.spyOn(authService, 'login');

      await controller.login(provider, code, mockRes);

      expect(oauthService.login).toHaveBeenCalledWith(provider, code);
      expect(authService.login).toHaveBeenCalledWith(mockUser, mockRes);
    });
  });
});
