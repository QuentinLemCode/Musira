import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { setupCache } from 'axios-cache-adapter';
import { env } from 'process';
import { catchError, firstValueFrom, map, of, pipe, retry } from 'rxjs';
import { Repository } from 'typeorm';
import { querystring } from '../../../utils/querystring';
import { SpotifyAccount } from '../spotify-account.entity';
import { SpotifyRefreshToken, SpotifyToken } from '../token';
import {
  CurrentPlaybackResponse,
  SpotifyTrackCategory,
  SpotifyURI,
} from '../types/spotify-interfaces';

export type PlaybackState =
  | {
      registered: true;
      currentPlayback: CurrentPlaybackResponse;
    }
  | {
      registered: false;
    };

export type APIErrorTypes =
  | 'invalid_token'
  | 'invalid_request'
  | 'invalid_scope'
  | 'no-device'
  | 'unregistered'
  | 'unknown';

export type APIResult<T = void> = {
  status: 'success' | 'error';
  cause?: APIErrorTypes;
  data?: T extends any ? T : never;
};

@Injectable()
export class SpotifyApiService implements OnModuleInit {
  constructor(
    private http: HttpService,
    @InjectRepository(SpotifyAccount)
    private spotifyAccount: Repository<SpotifyAccount>,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  private currentRegisteredAccount: SpotifyAccount;
  private readonly logger = new Logger('SpotifyAPI');
  private readonly cache = setupCache({
    maxAge: 10000,
  });

  private static readonly INTERVAL_RENEW_TOKEN_TIME = 1000 * 1000; // 1000 seconds
  private static readonly INTERVAL_RENEW_TOKEN_NAME = 'renew-token';

  private readonly formUrlContentTypeHeader = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  async onModuleInit() {
    this.currentRegisteredAccount = await this.getAccount();
    if (this.isAccountRegistered()) {
      await this.renewToken();
      this.startTokenRenewInterval();
    }
  }

  isAccountRegistered(): boolean {
    return (
      this.currentRegisteredAccount.expires_at !== null &&
      this.currentRegisteredAccount.expires_at >= Date.now()
    );
  }

  async unregisterPlayer() {
    this.currentRegisteredAccount.access_token = '';
    this.currentRegisteredAccount.expires_at = new Date().getTime() - 1;
    this.currentRegisteredAccount.refresh_token = '';
    this.currentRegisteredAccount.token_type = '';
    this.currentRegisteredAccount.scope = '';
    this.spotifyAccount.save(this.currentRegisteredAccount);
    this.stopTokenRenewInterval();
  }

  async registerPlayer(code: string) {
    const form = {
      code: code,
      redirect_uri: this.redirectUrl,
      grant_type: 'authorization_code',
    };

    const response = await firstValueFrom(
      this.http
        .post<SpotifyToken>(
          'https://accounts.spotify.com/api/token',
          querystring(form),
          {
            headers: {
              Authorization:
                'Basic ' +
                Buffer.from(
                  env.SPOTIFY_CLIENT_ID + ':' + env.SPOTIFY_CLIENT_KEY,
                ).toString('base64'),
              ...this.formUrlContentTypeHeader,
            },
          },
        )
        .pipe(this.pipeResponse()),
    );

    const account = {
      ...(await this.getAccount()),
      ...response.data,
      expires_at: Date.now() + (response.data.expires_in - 10) * 1000,
    };
    await this.spotifyAccount.save(account);
    this.currentRegisteredAccount = account;
    this.startTokenRenewInterval();
  }

  async getPlaybackState(
    noCache = false,
  ): Promise<APIResult<PlaybackState | void>> {
    if (!this.isAccountRegistered) {
      return this.success({
        registered: false,
      });
    }

    const options: AxiosRequestConfig = {
      headers: {
        ...this.getAuthorizationHeaderForCurrentPlayer(),
      },
    };

    if (!noCache) {
      // I don't want a 418
      options.adapter = this.cache.adapter;
    }

    return firstValueFrom(
      this.http
        .get<CurrentPlaybackResponse>(
          'https://api.spotify.com/v1/me/player',
          options,
        )
        .pipe(
          retry({ count: 5, delay: 1000 }),
          map((response) => {
            return this.success({
              registered: true,
              currentPlayback: response.data,
            });
          }),
          catchError((err) => {
            this.logError(err);
            return of(this.error('unknown'));
          }),
        ),
    );
  }

  async skipToNext() {
    if (!this.isAccountRegistered) {
      return this.error('unregistered');
    }
    return firstValueFrom(
      this.http
        .post(
          'https://api.spotify.com/v1/me/player/next',
          {},
          {
            headers: this.getAuthorizationHeaderForCurrentPlayer(),
          },
        )
        .pipe(retry({ count: 5, delay: 1000 }), this.pipeResponse()),
    );
  }

  async addToQueue(uri: SpotifyURI<SpotifyTrackCategory>): Promise<APIResult> {
    if (!this.isAccountRegistered) {
      return this.error('unregistered');
    }
    return firstValueFrom(
      this.http
        .post(
          'https://api.spotify.com/v1/me/player/queue',
          {},
          {
            headers: this.getAuthorizationHeaderForCurrentPlayer(),
            params: {
              uri,
            },
          },
        )
        .pipe(retry({ count: 5, delay: 1000 }), this.pipeResponse()),
    );
  }

  async play(uri: SpotifyURI<SpotifyTrackCategory>): Promise<APIResult> {
    if (!this.isAccountRegistered) {
      return this.error('unregistered');
    }
    return firstValueFrom(
      this.http
        .put(
          'https://api.spotify.com/v1/me/player/play',
          {
            uris: [uri],
          },
          {
            headers: this.getAuthorizationHeaderForCurrentPlayer(),
          },
        )
        .pipe(
          retry({ count: 5, delay: 1000 }),
          this.pipeResponse((status) => {
            if (status === 404) {
              return this.error('no-device');
            }
          }),
        ),
    );
  }

  get redirectUrl() {
    if (!process.env.REDIRECT_HOST) {
      throw new ServiceUnavailableException('Redirect host not set on server');
    }
    return process.env.REDIRECT_HOST + '/admin/spotify-device';
  }

  private pipeResponse(errorCase?: (status: number) => APIResult | void) {
    return pipe(
      map((response: AxiosResponse) => {
        return this.success(response.data);
      }),
      catchError((err) => {
        this.logError(err);
        if (errorCase) {
          const error = errorCase(err.status);
          if (error) return of(error);
        }
        return of(this.error('unknown'));
      }),
    );
  }

  private success<T = void>(data?: T): APIResult<T> {
    if (!data) {
      return { status: 'success' };
    }
    return {
      status: 'success',
      data,
    };
  }

  private error(cause: APIErrorTypes): APIResult<void> {
    return {
      status: 'error',
      cause,
    };
  }

  private async getAccount(): Promise<SpotifyAccount> {
    let account = await this.spotifyAccount.findOneBy({ id: 1 });
    if (!account) {
      account = this.spotifyAccount.create({ id: 1 });
      this.spotifyAccount.save(account);
    }
    return account;
  }

  private getAuthorizationHeaderForCurrentPlayer() {
    return {
      Authorization: `${this.currentRegisteredAccount.token_type} ${this.currentRegisteredAccount.access_token}`,
    };
  }

  private logError(err: any) {
    const message = [err?.message, err?.response?.data?.error?.message]
      .filter((a) => !!a)
      .join(' - ');
    this.logger.error(message, err);
  }

  private async renewToken() {
    this.logger.log('Renewing token...');
    const form = {
      refresh_token: this.currentRegisteredAccount.refresh_token,
      grant_type: 'refresh_token',
    };

    const response = await firstValueFrom(
      this.http
        .post<SpotifyRefreshToken>(
          'https://accounts.spotify.com/api/token',
          querystring(form),
          {
            headers: {
              Authorization:
                'Basic ' +
                Buffer.from(
                  env.SPOTIFY_CLIENT_ID + ':' + env.SPOTIFY_CLIENT_KEY,
                ).toString('base64'),
              ...this.formUrlContentTypeHeader,
            },
          },
        )
        .pipe(this.pipeResponse()),
    );
    if (response.status === 'error') {
      return;
    }

    this.logger.log('Token renewed succecssfully ! Saving it to database ...');
    const account = {
      ...(await this.getAccount()),
      ...response.data,
      expires_at: Date.now() + (response.data.expires_in - 10) * 1000,
    };
    await this.spotifyAccount.save(account);
    this.currentRegisteredAccount = account;
  }

  private startTokenRenewInterval() {
    if (
      this.schedulerRegistry.doesExist(
        'interval',
        SpotifyApiService.INTERVAL_RENEW_TOKEN_NAME,
      )
    ) {
      return;
    }
    const callback = () => {
      this.renewToken();
    };

    const interval = setInterval(
      callback,
      SpotifyApiService.INTERVAL_RENEW_TOKEN_TIME,
    );
    this.schedulerRegistry.addInterval(
      SpotifyApiService.INTERVAL_RENEW_TOKEN_NAME,
      interval,
    );
  }

  private stopTokenRenewInterval() {
    this.schedulerRegistry.deleteInterval(
      SpotifyApiService.INTERVAL_RENEW_TOKEN_NAME,
    );
  }
}
