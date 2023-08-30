import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MusicSession } from '../../music-session/entities/music-session.entity';
import { JwtGuard } from '../../users/jwt/jwt.guard';
import { SessionCreatorGuard } from '../../users/session-creator.guard';
import { MusicSessionParam } from '../../utils/decorators/music-session.decorator';
import { Music } from '../music.entity';
import { BacklogController } from './backlog.controller';
import { BacklogService } from './backlog.service';
import { MusicSessionPipe } from '../../utils/pipes/music-session.pipe';
import { mockMusicSessionPipe } from '../../../test-utils/mock';

// Mocking Services and Guards
const mockBacklogService = {
  push: jest.fn(),
  delete: jest.fn(),
  get: jest.fn(),
};

const mockJwtGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

const mockSessionCreatorGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

const mockMusicSessionParam = jest.fn().mockReturnValue(new MusicSession());

describe('BacklogController', () => {
  let controller: BacklogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BacklogController],
      providers: [
        { provide: BacklogService, useValue: mockBacklogService },
        { provide: JwtGuard, useValue: mockJwtGuard },
        { provide: SessionCreatorGuard, useValue: mockSessionCreatorGuard },
        { provide: MusicSessionParam, useValue: mockMusicSessionParam },
      ],
    })
      .overrideGuard(JwtGuard)
      .useValue(mockJwtGuard)
      .overrideGuard(SessionCreatorGuard)
      .useValue(mockSessionCreatorGuard)
      .overridePipe(MusicSessionPipe)
      .useValue(mockMusicSessionPipe)
      .compile();

    controller = module.get<BacklogController>(BacklogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('pushToBacklog', () => {
    it('should push music to backlog and return response', async () => {
      const music = new Music();
      const musicSession = new MusicSession();
      mockBacklogService.push.mockResolvedValue(music);

      const result = await controller.pushToBacklog(music, musicSession);

      expect(result).toEqual(music);
    });
  });

  describe('deleteBacklog', () => {
    it('should delete backlog item and return success message', async () => {
      const deletedItemId = '123';
      mockBacklogService.delete.mockResolvedValue(true);

      await controller.deleteBacklog(deletedItemId);

      expect(mockBacklogService.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException when backlog item not found', async () => {
      const deletedItemId = '123';
      mockBacklogService.delete.mockRejectedValue(new Error('not found'));

      await expect(controller.deleteBacklog(deletedItemId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getBackLog', () => {
    it('should get backlog items and return response', async () => {
      const musicSession = new MusicSession();
      const backlogItems = [new Music(), new Music()];
      mockBacklogService.get.mockResolvedValue(backlogItems);

      const result = await controller.getBackLog(musicSession);

      expect(result).toEqual(backlogItems);
    });
  });
});
