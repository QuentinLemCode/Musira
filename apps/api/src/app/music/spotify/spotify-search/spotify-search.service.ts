import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { env } from 'process';
import { catchError, firstValueFrom, from, map, mergeMap, of } from 'rxjs';
import { Token, TokenWithCalculatedExpiration } from '../token';
import { SearchResponse } from '../types/spotify-interfaces';

@Injectable()
export class SpotifySearchService implements OnModuleInit {
  private currentToken: TokenWithCalculatedExpiration;
  private readonly logger = new Logger('SpotifySearch');
  constructor(private http: HttpService) {}

  async onModuleInit() {
    await this.loadToken();
  }

  async search(query: string): Promise<SearchResponse> {
    const token = await this.key;
    const searchRequest = this.searchRequest(query, token);
    return firstValueFrom(
      searchRequest.pipe(
        catchError((err) => {
          this.logger.error(err, err?.response, err?.message);
          return of(err);
        }),
        mergeMap((response) => {
          if (response.status === 401) {
            this.logger.warn(
              'Received 401 error while searching, bad token expiry date',
            );
            return from(this.loadToken()).pipe(
              mergeMap((token) => {
                return this.searchRequest(query, token.access_token);
              }),
            );
          } else if (response.status >= 400) {
            this.logger.error(
              response.status +
                'error while searching - verify spotify app keys',
              response.statusText,
              response.data,
            );
            throw new InternalServerErrorException(response.data);
          }
          return of(response);
        }),
        map((response) => response.data),
      ),
    );
  }

  getToken(): Promise<Token> {
    return firstValueFrom(this.getTokenRequest());
  }

  private saveToken(token: Token) {
    this.currentToken = {
      ...token,
      expiryDate: new Date(new Date().getTime() + token.expires_in * 1000),
    };
  }

  private get key(): Promise<string> {
    if (this.currentToken?.expiryDate >= new Date()) {
      return Promise.resolve(this.currentToken.access_token);
    }
    return this.loadToken().then((token) => token.access_token);
  }

  private async loadToken(): Promise<Token> {
    if (this.currentToken?.expiryDate) {
      this.logger.log(
        `App token expired at current date : ${new Date()} for token expiry date : ${
          this.currentToken?.expiryDate
        }. Refreshing...`,
      );
    }
    const token = await this.getToken();
    this.saveToken(token);
    return token;
  }

  private searchRequest(query: string, key: string) {
    return this.http.get<SearchResponse>('https://api.spotify.com/v1/search', {
      params: {
        q: query,
        type: 'track,artist',
        limit: 10,
        market: 'FR',
      },
      headers: {
        Authorization: 'Bearer ' + key,
      },
    });
  }

  private getTokenRequest() {
    return this.http
      .post<Token>(
        'https://accounts.spotify.com/api/token',
        'grant_type=client_credentials',
        {
          headers: {
            Authorization:
              'Basic ' +
              Buffer.from(
                env.SPOTIFY_CLIENT_ID + ':' + env.SPOTIFY_CLIENT_KEY,
              ).toString('base64'),
          },
        },
      )
      .pipe(
        map((response) => response.data),
        catchError((err) => {
          this.logger.error(
            'error while getting search token - verify spotify app keys',
            err,
            err?.response,
          );
          throw new InternalServerErrorException(err);
        }),
      );
  }
}
