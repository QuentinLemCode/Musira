import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { MusicSessionService } from '../../music-session/music-session.service';
import { UsersService } from '../../users/users.service';
import { BacklogService } from '../backlog/backlog.service';
import { QueueEngineService } from './queue-engine/queue-engine.service';
import { QueueController } from './queue.controller';
import { QueueService } from './queue.service';

describe('QueueController', () => {
  let controller: QueueController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QueueController],
      providers: [
        {
          provide: QueueService,
          useValue: {
            getQueue: () => null,
            addToQueue: () => null,
          },
        },
        {
          provide: UsersService,
          useValue: {
            findById: () => null,
          },
        },
        {
          provide: QueueEngineService,
          useValue: {},
        },
        {
          provide: BacklogService,
          useValue: {},
        },
        {
          provide: MusicSessionService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<QueueController>(QueueController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
