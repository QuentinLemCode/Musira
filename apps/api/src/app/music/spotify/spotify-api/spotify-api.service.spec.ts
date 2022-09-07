import { HttpModule } from '@nestjs/axios';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SpotifyAccount } from '../spotify-account.entity';
import { SpotifyApiService } from './spotify-api.service';

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
      ],
      imports: [HttpModule],
    }).compile();

    service = module.get<SpotifyApiService>(SpotifyApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
