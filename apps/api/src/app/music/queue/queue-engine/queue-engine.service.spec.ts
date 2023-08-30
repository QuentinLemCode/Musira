import { SchedulerRegistry } from '@nestjs/schedule';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { BacklogService } from '../../backlog/backlog.service';
import { SpotifyApiService } from '../../spotify/spotify-api/spotify-api.service';
import { QueueService } from '../queue.service';
import { QueueEngineService } from './queue-engine.service';

describe('QueueEngineService', () => {
  let service: QueueEngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueEngineService,
        { provide: SpotifyApiService, useValue: {} },
        { provide: QueueService, useValue: {} },
        { provide: SchedulerRegistry, useValue: {} },
        { provide: BacklogService, useValue: {} },
      ],
    }).compile();

    service = module.get<QueueEngineService>(QueueEngineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
