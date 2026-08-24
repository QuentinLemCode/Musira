import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { OAuthUser } from '../../users/user.oauth.entity';
import { UsersService } from '../../users/users.service';
import { OAuthProvider, type OAuthProviderType } from '../types';

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

interface MicrosoftToken {
  token_type: string;
  scope: string;
  expires_in: number;
  access_token: string;
  refresh_token?: string;
  id_token: string;
}

interface MicrosoftUser {
  id: string;
  mail: string;
  displayName: string;
  surname: string;
  givenName: string;
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
      case OAuthProvider.MICROSOFT:
        return this.microsoftLogin(code);
      default:
        throw new ServiceUnavailableException();
    }
  }

  private async microsoftLogin(code: string) {
    const url = 'https://login.microsoftonline.com/consumers/oauth2/v2.0/token';
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    const body = new URLSearchParams({
      client_id: process.env.MICROSOFT_APP_ID || '',
      client_secret: process.env.MICROSOFT_APP_SECRET || '',
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: this.redirectUri(OAuthProvider.MICROSOFT),
      scope: 'https://graph.microsoft.com/User.Read openid profile email',
    });

    const microsoftRequest = await fetch(url.toString(), {
      method: 'POST',
      headers,
      body,
    });
    if (!microsoftRequest.ok) {
      this.logError(microsoftRequest);
      throw new BadRequestException('Invalid code');
    }
    const microsoftResponse: MicrosoftToken = await microsoftRequest.json();

    const microsoftUserRequest = await fetch(
      'https://graph.microsoft.com/v1.0/me',
      {
        headers: {
          Authorization: `Bearer ${microsoftResponse.access_token}`,
        },
      },
    );
    if (!microsoftUserRequest.ok) {
      this.logError(microsoftUserRequest);
      throw new ServiceUnavailableException();
    }
    const microsoftUser: MicrosoftUser = await microsoftUserRequest.json();

    this.logger.log(
      `Authenticated Microsoft user ${microsoftUser.id} via OAuth`,
    );

    return this.users.OAuthLogin(
      microsoftUser.mail,
      microsoftUser.givenName,
      microsoftUser.surname,
      '',
      microsoftUser.id,
      OAuthProvider.MICROSOFT,
    );
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
      this.logError(googleRequest);
      throw new ServiceUnavailableException();
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
      this.logError(googleUser);
      throw new ServiceUnavailableException();
    }
    const user: GoogleUser = await googleUser.json();
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
      this.redirectUri(OAuthProvider.FACEBOOK),
    );
    url.searchParams.set(
      'client_secret',
      process.env.FACEBOOK_APP_SECRET || '',
    );
    url.searchParams.set('code', code);

    const fbRequest = await fetch(url.toString());
    if (!fbRequest.ok) {
      this.logError(fbRequest);
      throw new ServiceUnavailableException();
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
      this.logError(fbRequest);
      throw new ServiceUnavailableException();
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
      this.logError(request);
      throw new ServiceUnavailableException();
    }
    return request.json();
  }

  private async logError(response: Response) {
    const body = await response.json();
    this.logger.log(
      `Request failed to ${response.url} : ${
        response.statusText
      }. response : ${JSON.stringify(body)}`,
    );
  }

  private redirectUri(provider: OAuthProviderType) {
    return process.env.REDIRECT_HOST + '/oauth/callback/' + provider;
  }
}
