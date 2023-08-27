import { HttpService } from '@nestjs/axios';
import type { OnModuleInit } from '@nestjs/common';
import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { env } from 'process';
import { catchError, firstValueFrom, map, of, pipe, retry, tap } from 'rxjs';
import { Repository } from 'typeorm';
import { querystring } from '../../../utils/querystring';
import { SpotifyAccount } from '../spotify-account.entity';
import type { SpotifyRefreshToken, SpotifyToken } from '../token';
import type { Cache } from 'cache-manager';
import type {
  CurrentPlaybackResponse,
  SpotifyTrackCategory,
  SpotifyURI,
} from '../types/spotify-interfaces';
import type { MusicSession } from '../../../music-session/entities/music-session.entity';
import { MusicSessionService } from '../../../music-session/music-session.service';

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
  data?: T;
};

@Injectable()
export class SpotifyApiService implements OnModuleInit {
  constructor(
    private readonly http: HttpService,
    @InjectRepository(SpotifyAccount)
    private readonly spotifyAccount: Repository<SpotifyAccount>,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly sessions: MusicSessionService,
    @Inject('CACHE_MANAGER') private readonly cache: Cache,
  ) {}

  private readonly logger = new Logger('SpotifyAPI');

  private static readonly INTERVAL_RENEW_TOKEN_TIME = 1000 * 1000; // 1000 seconds
  private static readonly INTERVAL_RENEW_TOKEN_NAME = 'renew-token';

  private readonly formUrlContentTypeHeader = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  async onModuleInit() {
    const sessions = await this.sessions.getActiveSessions();
    for (const session of sessions) {
      const account = await session.spotify_account;
      if (!account) continue;
      await this.renewToken(account);
      this.startTokenRenewInterval(account);
    }
  }

  async isAccountRegistered(musicSession: MusicSession): Promise<boolean> {
    const account = await musicSession.spotify_account;
    return (
      (account &&
        account.expires_at !== null &&
        account.expires_at >= Date.now()) ??
      false
    );
  }

  async unregisterPlayer(musicSession: MusicSession) {
    const currentAccount = await musicSession.spotify_account;
    if (!currentAccount) return;
    this.spotifyAccount.remove(currentAccount);
    this.stopTokenRenewInterval();
  }

  async registerPlayer(musicSession: MusicSession, code: string) {
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

    const account: SpotifyAccount = {
      ...(await musicSession.spotify_account),
      ...response.data,
      expires_at: Date.now() + (response.data.expires_in - 10) * 1000,
      music_session: musicSession,
    };

    await this.spotifyAccount.save(account);
    this.startTokenRenewInterval(account);
  }

  async getPlaybackState(
    musicSession: MusicSession,
    noCache = false,
  ): Promise<APIResult<PlaybackState | void>> {
    if (!this.isAccountRegistered) {
      return this.success({
        registered: false,
      });
    }

    if (!noCache) {
      const playerCache = await this.cache.get<
        CurrentPlaybackResponse | undefined
      >('player');
      if (playerCache) {
        return this.success({
          registered: true,
          currentPlayback: playerCache,
        });
      }
    }

    const options: AxiosRequestConfig = {
      headers: {
        ...(await this.getAuthorizationHeaderForCurrentPlayer(musicSession)),
      },
    };

    return firstValueFrom(
      this.http
        .get<CurrentPlaybackResponse>(
          'https://api.spotify.com/v1/me/player',
          options,
        )
        .pipe(
          retry({ count: 5, delay: 100 }),
          tap(async (response) => {
            await this.cache.set('player', response.data, 1000);
          }),
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

  async skipToNext(musicSession: MusicSession) {
    if (!this.isAccountRegistered) {
      return this.error('unregistered');
    }
    return firstValueFrom(
      this.http
        .post(
          'https://api.spotify.com/v1/me/player/next',
          {},
          {
            headers: await this.getAuthorizationHeaderForCurrentPlayer(
              musicSession,
            ),
          },
        )
        .pipe(retry({ count: 5, delay: 1000 }), this.pipeResponse()),
    );
  }

  async addToQueue(
    musicSession: MusicSession,
    uri: SpotifyURI<SpotifyTrackCategory>,
  ): Promise<APIResult> {
    if (!this.isAccountRegistered) {
      return this.error('unregistered');
    }
    return firstValueFrom(
      this.http
        .post(
          'https://api.spotify.com/v1/me/player/queue',
          {},
          {
            headers: await this.getAuthorizationHeaderForCurrentPlayer(
              musicSession,
            ),
            params: {
              uri,
            },
          },
        )
        .pipe(retry({ count: 5, delay: 1000 }), this.pipeResponse()),
    );
  }

  async play(
    musicSession: MusicSession,
    uri: SpotifyURI<SpotifyTrackCategory>,
  ): Promise<APIResult> {
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
            headers: await this.getAuthorizationHeaderForCurrentPlayer(
              musicSession,
            ),
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
    return process.env.REDIRECT_HOST + '/spotify-auth';
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

  private async getAuthorizationHeaderForCurrentPlayer(
    musicSession: MusicSession,
  ) {
    const account = await musicSession.spotify_account;
    return {
      Authorization: `${account?.token_type} ${account?.access_token}`,
    };
  }

  private logError(err: {
    message?: string;
    response: {
      data?: {
        error?: { message: string };
      };
    };
  }) {
    const message = [err?.message, err?.response?.data?.error?.message]
      .filter((a) => !!a)
      .join(' - ');
    this.logger.error(message, err);
  }

  private async renewToken(account: SpotifyAccount) {
    const musicSession = await account.music_session;
    this.logger.log(`Renewing token for session ${musicSession.id} ...`);
    const form = {
      refresh_token: account.refresh_token,
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

    this.logger.log('Token renewed successfully ! Saving it to database ...');
    const renewedAccount: SpotifyAccount = {
      ...account,
      ...response.data,
      music_session: account.music_session,
      expires_at: Date.now() + (response.data.expires_in - 10) * 1000,
    };
    await this.spotifyAccount.save(renewedAccount);
  }

  private startTokenRenewInterval(account: SpotifyAccount) {
    if (
      this.schedulerRegistry.doesExist(
        'interval',
        SpotifyApiService.INTERVAL_RENEW_TOKEN_NAME,
      )
    ) {
      return;
    }
    const callback = () => {
      this.renewToken(account);
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
