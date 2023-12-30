import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { OAuthProvider, type OAuthProviderType } from '@musira/api-interfaces';
import type { OAuthUser } from '../../users/user.oauth.entity';

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

interface GoogleToken {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token: string;
  refresh_token?: string;
}

interface GoogleUser {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

@Injectable()
export class OAuthService {
  private logger = new Logger(OAuthService.name);

  constructor(@Inject(UsersService) private readonly users: UsersService) {}

  login(provider: OAuthProviderType, code: string): Promise<OAuthUser> {
    switch (provider) {
      case OAuthProvider.FACEBOOK:
        return this.facebookLogin(code);
      case OAuthProvider.GOOGLE:
        return this.googleLogin(code);
      default:
        throw new ServiceUnavailableException();
    }
  }

  private async googleLogin(code: string) {
    const url = new URL('https://oauth2.googleapis.com/token');
    url.searchParams.set('client_id', process.env.GOOGLE_APP_ID || '');
    url.searchParams.set('client_secret', process.env.GOOGLE_APP_SECRET || '');
    url.searchParams.set('code', code);
    url.searchParams.set('grant_type', 'authorization_code');
    url.searchParams.set(
      'redirect_uri',
      process.env.REDIRECT_HOST + '/oauth/callback/' + OAuthProvider.GOOGLE,
    );

    const googleRequest = await fetch(url.toString(), { method: 'POST' });
    if (!googleRequest.ok) {
      throw new BadRequestException('Invalid code');
    }
    const googleResponse: GoogleToken = await googleRequest.json();
    const googleUser = await fetch(
      'https://www.googleapis.com/oauth2/v1/userinfo?alt=json',
      {
        headers: {
          Authorization: `Bearer ${googleResponse.access_token}`,
        },
      },
    );
    if (!googleUser.ok) {
      throw new ServiceUnavailableException();
    }
    const user: GoogleUser = await googleUser.json();
    this.logger.log(user);
    return this.users.OAuthLogin(
      user.email,
      user.given_name,
      user.family_name,
      user.picture,
      user.id,
      OAuthProvider.GOOGLE,
    );
  }

  private async facebookLogin(code: string) {
    const url = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
    url.searchParams.set('client_id', process.env.FACEBOOK_APP_ID || '');
    url.searchParams.set(
      'redirect_uri',
      process.env.REDIRECT_HOST + '/oauth/callback/' + OAuthProvider.FACEBOOK,
    );
    url.searchParams.set(
      'client_secret',
      process.env.FACEBOOK_APP_SECRET || '',
    );
    url.searchParams.set('code', code);

    const fbRequest = await fetch(url.toString());
    if (!fbRequest.ok) {
      this.logger.log(
        `Facebook request failed: ${
          fbRequest.statusText
        }. Url : ${url.toString()}. response : ${await fbRequest.text()}`,
      );
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
    if (!fbRequest.ok) {
      this.logger.log(
        `Facebook request failed: ${
          fbRequest.statusText
        }. Url : ${url.toString()}. response : ${await fbRequest.text()}`,
      );
    }
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
    if (!request.ok) {
      this.logger.log(
        `Facebook request failed: ${
          request.statusText
        }. Url : ${url.toString()}. response : ${await request.text()}`,
      );
    }
    return request.json();
  }
}
