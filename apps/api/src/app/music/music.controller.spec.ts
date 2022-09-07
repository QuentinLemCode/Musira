import { Test, TestingModule } from '@nestjs/testing';
import { EMPTY } from 'rxjs';
import { JwtGuard } from 'src/auth/jwt.guard';
import { MusicController } from './music.controller';
import { QueueEngineService } from './queue/queue-engine/queue-engine.service';
import { QueueService } from './queue/queue.service';
import { SpotifyApiService } from './spotify/spotify-api/spotify-api.service';
import { SpotifySearchService } from './spotify/spotify-search/spotify-search.service';

describe('MusicController', () => {
  let controller: MusicController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MusicController],
      providers: [
        {
          provide: SpotifyApiService,
          useValue: {},
        },
        {
          provide: SpotifySearchService,
          useValue: {
            search: () => EMPTY,
          },
        },
        {
          provide: JwtGuard,
          useValue: {},
        },
        {
          provide: QueueService,
          useValue: {},
        },
        {
          provide: QueueEngineService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<MusicController>(MusicController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
