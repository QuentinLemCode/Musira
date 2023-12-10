import { HttpModule, HttpService } from '@nestjs/axios';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { AxiosResponse } from 'axios';
import { AxiosHeaders } from 'axios';
import { of, throwError } from 'rxjs';
import { SpotifySearchService } from './spotify-search.service.js';

describe('SpotifySearchService', () => {
  let service: SpotifySearchService;
  let httpService: HttpService;
  const tokenResponse: AxiosResponse = {
    status: 200,
    config: {
      headers: new AxiosHeaders(),
    },
    data: { access_token: 'valid' },
    headers: {},
    statusText: 'OK',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SpotifySearchService],
      imports: [HttpModule],
    }).compile();

    service = module.get<SpotifySearchService>(SpotifySearchService);
    httpService = module.get<HttpService>(HttpService);
    jest.spyOn(httpService, 'post').mockImplementation(() => of(tokenResponse));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should retry if token expired', async () => {
    const invalidResponse: AxiosResponse = {
      status: 401,
      data: '',
      statusText: 'Unauthorized',
      config: {
        headers: new AxiosHeaders(),
      },
      headers: {},
    };

    const validResponse: AxiosResponse = {
      status: 200,
      data: {},
      statusText: 'Unauthorized',
      config: {
        headers: new AxiosHeaders(),
      },
      headers: {},
    };

    service['currentToken'] = {
      expiryDate: new Date(2080, 1, 1),
      access_token: 'invalid',
      expires_in: 0,
      token_type: 'Bearer',
    };
    const invalidTokenResponse = { ...tokenResponse };
    invalidTokenResponse.data = { access_token: 'invalid' };

    const spyGet = jest
      .spyOn(httpService, 'get')
      .mockImplementation((_url, config) => {
        if (config?.headers?.Authorization === 'Bearer valid') {
          return of(validResponse);
        }
        return throwError(() => invalidResponse);
      });
    await service.search('test');
    expect(spyGet).toHaveBeenCalledTimes(2);
  });
});
