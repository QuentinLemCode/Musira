import { HttpModule } from '@nestjs/axios';
import { SchedulerRegistry } from '@nestjs/schedule';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SpotifyAccount } from '../spotify-account.entity.js';
import { SpotifyApiService } from './spotify-api.service.js';
import { MusicSessionService } from '../../../music-session/music-session.service.js';

describe('SpotifyApiService', () => {
  let service: SpotifyApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpotifyApiService,
        {
          provide: getRepositoryToken(SpotifyAccount),
          useValue: {
            findOne: () => null,
          },
        },
        { provide: SchedulerRegistry, useValue: {} },
        { provide: 'CACHE_MANAGER', useValue: {} },
        { provide: MusicSessionService, useValue: {} },
      ],
      imports: [HttpModule],
    }).compile();

    service = module.get<SpotifyApiService>(SpotifyApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
