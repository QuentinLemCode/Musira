import { ServiceUnavailableException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OAuthUser } from '../../users/user.oauth.entity';
import { UsersService } from '../../users/users.service';
import { OAuthService } from './oauth.service';
import { OAuthProvider, OAuthProviderType } from '@musira/api-interfaces';
describe('OAuthService', () => {
  let service: OAuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthService,
        {
          provide: UsersService,
          useValue: {
            OAuthLogin: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OAuthService>(OAuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should throw ServiceUnavailableException for unsupported provider', () => {
      const unsupportedProvider = 'unsupported' as OAuthProviderType; // Replace with unsupported provider
      expect(() => service.login(unsupportedProvider, 'code')).toThrow(
        ServiceUnavailableException,
      );
    });

    it('should call facebookLogin for Facebook provider', async () => {
      const code = 'valid_facebook_code';
      const mockUser = {
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        picture: {
          data: {
            height: 100,
            width: 100,
            url: 'https://example.com/profile.jpg',
            is_silhouette: false,
          },
        },
        id: 'facebook_user_id',
      };
      const mockPermissions = {
        data: [
          {
            permission: 'email',
            status: 'granted',
          },
          {
            permission: 'public_profile',
            status: 'granted',
          },
          {
            permission: 'user_friends',
            status: 'granted',
          },
        ],
      };
      const mockUserResponse = {
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockUser),
      };

      const mockUserPermissions = {
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockPermissions),
      };

      const mockCode = {
        ok: true,
        json: jest.fn().mockResolvedValueOnce({ access_token: 'token' }),
      };

      const urls: Record<string, any> = {
        'https://graph.facebook.com/v18.0/oauth/access_token': mockCode,
        'https://graph.facebook.com/v18.0/me/permissions': mockUserPermissions,
        'https://graph.facebook.com/v18.0/me': mockUserResponse,
      };

      jest
        .spyOn(global, 'fetch')
        .mockImplementation((url: string | URL | Request) => {
          url = typeof url === 'string' ? url : url.toString();
          url = url.split('?')[0] || '';
          return urls[url];
        });
      const user = {
        email: 'test@email.fr',
      } as OAuthUser;
      jest.spyOn(usersService, 'OAuthLogin').mockResolvedValueOnce(user);

      await service.login(OAuthProvider.FACEBOOK, code);

      expect(fetch).toHaveBeenCalledTimes(3);
    });
  });
});
