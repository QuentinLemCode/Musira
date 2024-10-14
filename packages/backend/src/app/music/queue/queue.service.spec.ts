import { ScheduleModule } from '@nestjs/schedule';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MusicSessionService } from '../../music-session/music-session.service';
import type { Music } from '../music.entity';
import {
  APIResult,
  SpotifyApiService,
} from '../spotify/spotify-api/spotify-api.service';
import type {
  CurrentPlaybackResponse,
  TrackObjectFull,
} from '../spotify/types/spotify-interfaces';
import { Queue, Status } from './queue.entity';
import { QueueService } from './queue.service';

describe('QueueService', () => {
  let service: QueueService;
  let mockSpotifyService: SpotifyApiService;

  const mockMusic: Music = {
    artist: 'artist',
    title: 'title',
    album: 'album',
    uri: 'spotify:track:id',
    cover: 'url',
    duration: 1000,
    queue: [],
  };
  const mockQueue: Partial<Queue> = {
    id: 1,
    music: mockMusic,
    status: Status.PENDING,
  };
  const mockTrackItem: TrackObjectFull = {
    uri: 'spotify:track:id',
    duration_ms: 1000,
  } as unknown as TrackObjectFull;
  const mockPlaybackResponse: Partial<CurrentPlaybackResponse> = {
    progress_ms: 100,
    item: mockTrackItem,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ScheduleModule.forRoot()],
      providers: [
        QueueService,
        {
          provide: MusicSessionService,
          useValue: {
            isAccountRegistered: jest.fn(() => Promise.resolve(true)),
            addToQueue: jest.fn(async (): Promise<APIResult> => {
              return {
                status: 'success',
              };
            }),
            getPlaybackState: jest.fn(() => {
              return Promise.resolve({
                status: 'success',
                data: {
                  registered: true,
                  currentPlayback:
                    mockPlaybackResponse as CurrentPlaybackResponse,
                },
              });
            }),
          },
        },
        {
          provide: SpotifyApiService,
          useValue: mockSpotifyService,
        },
        {
          provide: getRepositoryToken(Queue),
          useValue: {
            save: (obj: Queue) => obj,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            find: (conditions: any) => {
              if (conditions?.where?.status._value === "'1'") {
                return [];
              } else {
                return [mockQueue];
              }
            },
          },
        },
      ],
    }).compile();
    mockSpotifyService = module.get<SpotifyApiService>(SpotifyApiService);

    service = module.get<QueueService>(QueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  // the music has been paused
  // the music has been manually edited
  // we should put music in queue again
});
