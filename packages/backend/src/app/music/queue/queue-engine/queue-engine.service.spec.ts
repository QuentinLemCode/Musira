import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { MusicSessionService } from '../../../music-session/music-session.service';
import { BacklogService } from '../../backlog/backlog.service';
import { SpotifyApiService } from '../../spotify/spotify-api/spotify-api.service';
import { QueueService } from '../queue.service';
import { QueueEngineService } from './queue-engine.service';

describe('QueueEngineService', () => {
  let service: QueueEngineService;
  let testingModule: TestingModule;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueEngineService,
        { provide: SpotifyApiService, useValue: {} },
        {
          provide: QueueService,
          useValue: {
            getPlayingQueue: jest.fn().mockResolvedValue(null),
            setFinished: jest.fn(),
            pop: jest.fn(),
            setPlaying: jest.fn(),
          },
        },
        { provide: BacklogService, useValue: {} },
        { provide: 'BullQueue_music-engine', useValue: { add: jest.fn() } },
        { provide: MusicSessionService, useValue: {} },
      ],
    }).compile();

    testingModule = module;
    service = module.get<QueueEngineService>(QueueEngineService);
  });

  it('schedules engine launch job on start', async () => {
    const engineQueue: any = {
      add: jest.fn(),
      getJob: jest.fn().mockResolvedValue(null),
    };
    // Inject a private field via casting
    (service as any).engineQueue = engineQueue;
    const spotify = testingModule.get<any>(SpotifyApiService);
    (spotify as any).isAccountRegistered = jest.fn().mockResolvedValue(true);
    (spotify as any).play = jest.fn().mockResolvedValue({ status: 'success' });
    const queues = testingModule.get<any>(QueueService);
    queues.pop = jest.fn().mockResolvedValue({ id: 1, music: { uri: 'x' } });
    queues.setPlaying = jest.fn();
    await service.start({ id: 2 } as any);
    expect(engineQueue.add).toHaveBeenCalledWith(
      'engine.launch',
      { musicSessionId: 2, queueId: 1, forwarded: false },
      expect.objectContaining({ jobId: 'forward-restart' }),
    );
  });
});
