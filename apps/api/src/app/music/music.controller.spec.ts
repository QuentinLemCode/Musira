import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  mockJwtGuard,
  mockMusicSessionPipe,
  mockSessionCreatorGuard,
} from '../../test-utils/mock';
import { MusicSession } from '../music-session/entities/music-session.entity';
import { JwtGuard } from '../users/jwt/jwt.guard';
import { SessionCreatorGuard } from '../users/session-creator.guard';
import { MusicSessionPipe } from '../utils/pipes/music-session.pipe';
import { MusicController } from './music.controller';
import { CurrentMusic, Music } from './music.interface';
import { QueueEngineService } from './queue/queue-engine/queue-engine.service';
import { QueueService } from './queue/queue.service';
import { SpotifyApiService } from './spotify/spotify-api/spotify-api.service';
import { SpotifySearchService } from './spotify/spotify-search/spotify-search.service';
import {
  AlbumObjectSimplified,
  ArtistObjectSimplified,
  SearchResponse,
} from './spotify/types/spotify-interfaces';

describe('MusicController', () => {
  let musicController: MusicController;
  const spotifyApiService = {
    getTrack: jest.fn(),
    isAccountRegistered: jest.fn(),
    getPlaybackState: jest.fn(),
  };
  const spotifySearchService = {
    search: jest.fn(),
  };
  const queueService = {
    get: jest.fn(),
    add: jest.fn(),
  };
  const queueEngineService = {
    start: jest.fn(),
    stop: jest.fn(),
    isRunning: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MusicController],
      providers: [
        { provide: SpotifyApiService, useValue: spotifyApiService },
        {
          provide: SpotifySearchService,
          useValue: spotifySearchService,
        },
        { provide: QueueService, useValue: queueService },
        { provide: QueueEngineService, useValue: queueEngineService },
      ],
    })
      .overrideGuard(JwtGuard)
      .useValue(mockJwtGuard)
      .overrideGuard(SessionCreatorGuard)
      .useValue(mockSessionCreatorGuard)
      .overridePipe(MusicSessionPipe)
      .useValue(mockMusicSessionPipe)
      .compile();

    spotifyApiService.isAccountRegistered.mockReturnValue(
      Promise.resolve(true),
    );
    queueService.get.mockReturnValue([]);
    spotifyApiService.getPlaybackState.mockReturnValue({
      data: {
        registered: true,
        currentPlayback: {},
      },
    });

    musicController = module.get<MusicController>(MusicController);
  });

  describe('search', () => {
    it('should return an array of Music when given a valid query', async () => {
      const query = 'some query';
      const searchResponse: SearchResponse = {
        tracks: {
          items: [
            {
              album: { name: 'Album 1' } as AlbumObjectSimplified,
              artists: [{ name: 'Artist 1' }] as ArtistObjectSimplified[],
              name: 'Track 1',
              uri: 'spotify:track:aze',
              duration_ms: 300000,
              type: 'track',
              disc_number: 1,
              explicit: false,
              external_ids: { isrc: 'FRZ123456789' },
              external_urls: { spotify: 'https://open.spotify.com/track/aze' },
              href: 'https://api.spotify.com/v1/tracks/aze',
              id: 'aze',
              popularity: 100,
              preview_url: 'https://p.scdn.co/mp3-preview/aze',
              track_number: 1,
              is_playable: true,
            },
          ],
          href: 'https://api.spotify.com/v1/search?query=track%3Atrack+artist%3Aartist&type=track&offset=0&limit=20',
          limit: 20,
          next: null,
          offset: 0,
          previous: null,
          total: 1,
        },
      };
      spotifySearchService.search = jest.fn().mockResolvedValue(searchResponse);

      const result: Music[] = await musicController.search(query);

      expect(result).toEqual([
        {
          album: 'Album 1',
          artist: 'Artist 1',
          cover: undefined,
          title: 'Track 1',
          uri: 'spotify:track:aze',
          duration: 300000,
        },
      ]);
      expect(spotifySearchService.search).toHaveBeenCalledWith(query);
    });

    it('should throw BadRequestException when no query is provided', async () => {
      await expect(musicController.search('')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('start', () => {
    it('should start the queue engine and return CurrentMusic', async () => {
      const musicSession: MusicSession = new MusicSession(); // You may need to create a valid MusicSession instance
      const queueEngineStatus = { message: 'Queue engine started' };
      queueEngineService.start = jest.fn().mockResolvedValue(queueEngineStatus);
      queueEngineService.isRunning = true;

      const result: CurrentMusic = await musicController.start(musicSession);

      expect(result).toEqual({
        isSpotifyAccountRegistered: true,
        queue: [],
        currentPlay: null,
        engineStarted: true,
        message: queueEngineStatus.message,
      });
      expect(queueEngineService.start).toHaveBeenCalledWith(musicSession);
    });
  });

  describe('stop', () => {
    it('should stop the queue engine and return CurrentMusic', async () => {
      const musicSession: MusicSession = new MusicSession(); // You may need to create a valid MusicSession instance
      queueEngineService.stop = jest.fn();
      queueEngineService.isRunning = false;
      const result: CurrentMusic = await musicController.stop(musicSession);

      expect(result).toEqual({
        isSpotifyAccountRegistered: true,
        queue: [],
        currentPlay: null,
        engineStarted: false,
        message: undefined,
      });
      expect(queueEngineService.stop).toHaveBeenCalled();
    });
  });

  describe('currentState', () => {
    it('should return the current state of music session', async () => {
      const musicSession: MusicSession = new MusicSession(); // You may need to create a valid MusicSession instance
      const currentState: CurrentMusic = {
        isSpotifyAccountRegistered: true,
        queue: [],
        currentPlay: null,
        engineStarted: false,
      };
      jest
        .spyOn(musicController, 'currentState')
        .mockResolvedValue(currentState);

      const result: CurrentMusic =
        await musicController.currentState(musicSession);

      expect(result).toEqual(currentState);
      expect(musicController.currentState).toHaveBeenCalledWith(musicSession);
    });
  });
});
