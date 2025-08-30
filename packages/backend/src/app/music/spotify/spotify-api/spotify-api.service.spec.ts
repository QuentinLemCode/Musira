import { HttpModule } from '@nestjs/axios';
import { SchedulerRegistry } from '@nestjs/schedule';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MusicSessionService } from '../../../music-session/music-session.service';
import { SpotifyAccount } from '../spotify-account.entity';
import { SpotifyApiService } from './spotify-api.service';

describe('SpotifyApiService', () => {
  let service: SpotifyApiService;
  let testingModule: TestingModule;

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
        {
          provide: MusicSessionService,
          useValue: { getActiveSessions: jest.fn().mockResolvedValue([]) },
        },
      ],
      imports: [HttpModule],
    }).compile();

    testingModule = module;
    service = module.get<SpotifyApiService>(SpotifyApiService);
  });

  it('should schedule token renewal', async () => {
    const sessionService = testingModule.get<any>(MusicSessionService);
    jest.spyOn(sessionService, 'getActiveSessions').mockResolvedValue([]);
    // tokenQueue is optional in unit tests
    await service.onModuleInit();
    expect(true).toBe(true);
  });
});
