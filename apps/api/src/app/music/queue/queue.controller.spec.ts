import { Test, TestingModule } from '@nestjs/testing';
import { MusicSession } from '../../music-session/entities/music-session.entity';
import { UsersService } from '../../users/users.service';
import { BacklogService } from '../backlog/backlog.service';
import { QueueEngineService } from './queue-engine/queue-engine.service';
import { QueueController } from './queue.controller';
import { QueueService } from './queue.service';
import { mockJwtGuard, mockMusicSessionPipe } from '../../../test-utils/mock';
import { Queue } from './queue.entity';
import { MusicSessionPipe } from '../../utils/pipes/music-session.pipe';
import { JwtGuard } from '../../auth/jwt.guard';

// Mocking Services
const mockQueueService = {
  get: vi.fn(),
  push: vi.fn(),
  delete: vi.fn(),
  countQueuedItemForUser: vi.fn(),
};

const mockUsersService = {
  getQueuedMusicForUser: vi.fn(),
  findById: vi.fn(),
  findByEmail: vi.fn(),
};

const mockQueueEngineService = {
  forward: vi.fn(),
};

const mockBacklogService = {
  getNominatedBacklog: vi.fn(),
};

describe('QueueController', () => {
  let controller: QueueController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QueueController],
      providers: [
        { provide: QueueService, useValue: mockQueueService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: QueueEngineService, useValue: mockQueueEngineService },
        { provide: BacklogService, useValue: mockBacklogService },
      ],
    })
      .overrideGuard(JwtGuard)
      .useValue(mockJwtGuard)
      .overridePipe(MusicSessionPipe)
      .useValue(mockMusicSessionPipe)
      .compile();

    controller = module.get<QueueController>(QueueController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getQueue', () => {
    it('should get queue and backlog for a music session', async () => {
      const musicSession = new MusicSession();
      const queue: Queue[] = [];
      const backlog = null;
      mockQueueService.get.mockResolvedValue(queue);
      mockBacklogService.getNominatedBacklog.mockResolvedValue(backlog);

      const result = await controller.getQueue(musicSession);

      expect(result).toEqual({ queue, backlog });
    });
  });
});
