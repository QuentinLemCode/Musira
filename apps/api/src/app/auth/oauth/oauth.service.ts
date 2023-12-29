import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { OAuthProvider } from '@musira/api-interfaces';

interface FacebookToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface FacebookPermission {
  data: {
    permission: 'email' | 'public_profile' | 'user_friends';
    status: 'granted' | 'declined' | 'expired';
  }[];
}

interface FacebookUser {
  email: string;
  last_name: string;
  first_name: string;
  picture: {
    data: {
      height: number;
      width: number;
      url: string;
      is_silhouette: boolean;
    };
  };
  id: string;
}

@Injectable()
export class OAuthService {
  private logger = new Logger(OAuthService.name);

  constructor(@Inject(UsersService) private readonly users: UsersService) {}

  login(provider: OAuthProvider, code: string) {
    switch (provider) {
      case OAuthProvider.FACEBOOK:
        return this.facebookLogin(code);
      // case OAuthProvider.GOOGLE:
      //   return this.googleLogin(code);
      default:
        throw new ServiceUnavailableException();
    }
  }

  private googleLogin(code: string) {
    return code;
  }

  private async facebookLogin(code: string) {
    const url = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
    url.searchParams.set('client_id', process.env.FACEBOOK_APP_ID || '');
    url.searchParams.set(
      'redirect_uri',
      process.env.REDIRECT_HOST + '/oauth/callback',
    );
    url.searchParams.set(
      'client_secret',
      process.env.FACEBOOK_APP_SECRET || '',
    );
    url.searchParams.set('code', code);

    const fbRequest = await fetch(url.toString());
    if (!fbRequest.ok) {
      throw new BadRequestException('Invalid code');
    }
    const fbResponse: FacebookToken = await fbRequest.json();
    await this.checkFacebookPermission(fbResponse.access_token);
    const user = await this.retrieveFacebookUser(fbResponse.access_token);
    return this.users.OAuthLogin(
      user.email,
      user.first_name,
      user.last_name,
      user.picture.data.url,
      user.id,
      OAuthProvider.FACEBOOK,
    );
  }

  private async checkFacebookPermission(token: string) {
    const url = new URL('https://graph.facebook.com/v18.0/me/permissions');

    const fbRequest = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const fbResponse: FacebookPermission = await fbRequest.json();
    const permissions = fbResponse.data
      .filter((perm) => perm.status === 'granted')
      .map((perm) => perm.permission);
    if (!permissions.includes('email')) {
      throw new BadRequestException('Email permission not granted');
    }
  }

  private async retrieveFacebookUser(token: string): Promise<FacebookUser> {
    const url = new URL('https://graph.facebook.com/v18.0/me');
    url.searchParams.set(
      'fields',
      'id,name,first_name,middle_name,last_name,email,picture',
    );
    const request = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return request.json();
  }
}
