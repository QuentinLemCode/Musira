import { Test, TestingModule } from '@nestjs/testing';
import { JwtGuard } from '../../users/jwt/jwt.guard.js';
import { SessionCreatorGuard } from '../../users/session-creator.guard.js';
import { MusicSession } from '../entities/music-session.entity.js';
import { SettingsController, SettingsQuery } from './settings.controller.js';
import { SettingsService } from './settings.service.js';
import { Settings } from './settings.entity.js';
import { MusicSessionPipe } from '../../utils/pipes/music-session.pipe.js';
import { mockMusicSessionPipe } from '../../../test-utils/mock.js';

// Mocking Service
const mockSettingsService = {
  setMaxVotes: jest.fn(),
  setMaxQueuableSongPerUser: jest.fn(),
};

describe('SettingsController', () => {
  let controller: SettingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingsController],
      providers: [{ provide: SettingsService, useValue: mockSettingsService }],
    })
      .overrideGuard(JwtGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(SessionCreatorGuard)
      .useValue({ canActivate: () => true })
      .overridePipe(MusicSessionPipe)
      .useValue(mockMusicSessionPipe)
      .compile();

    controller = module.get<SettingsController>(SettingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('setSettings', () => {
    it('should set and return settings', async () => {
      const musicSession = new MusicSession();
      const settingsQuery: SettingsQuery = {
        maxVotes: 10,
        maxQueuableSongPerUser: 5,
      };
      mockSettingsService.setMaxVotes.mockResolvedValue(undefined);
      mockSettingsService.setMaxQueuableSongPerUser.mockResolvedValue(
        undefined,
      );
      musicSession.settings = Promise.resolve({
        id: 1,
        maxVotes: settingsQuery.maxVotes,
        maxQueuableSongPerUser: settingsQuery.maxQueuableSongPerUser,
      } as Settings);

      const result = await controller.setSettings(musicSession, settingsQuery);

      expect(result).toEqual(settingsQuery);
      expect(mockSettingsService.setMaxVotes).toHaveBeenCalledWith(
        musicSession,
        settingsQuery.maxVotes,
      );
      expect(
        mockSettingsService.setMaxQueuableSongPerUser,
      ).toHaveBeenCalledWith(
        musicSession,
        settingsQuery.maxQueuableSongPerUser,
      );
    });
  });

  describe('getSettings', () => {
    it('should return settings', async () => {
      const musicSession = new MusicSession();
      const settingsQuery: SettingsQuery = {
        maxVotes: 10,
        maxQueuableSongPerUser: 5,
      };
      musicSession.settings = Promise.resolve({
        id: 1,
        maxVotes: settingsQuery.maxVotes,
        maxQueuableSongPerUser: settingsQuery.maxQueuableSongPerUser,
      } as Settings);

      const result = await controller.getSettings(musicSession);

      expect(result).toEqual(settingsQuery);
    });
  });
});
