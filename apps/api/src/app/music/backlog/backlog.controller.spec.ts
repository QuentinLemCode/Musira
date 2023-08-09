import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { BacklogController } from './backlog.controller';
import { BacklogService } from './backlog.service';
import { MusicSessionService } from '../../music-session/music-session.service';

describe('BacklogController', () => {
  let controller: BacklogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BacklogController],
      providers: [
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

    controller = module.get<BacklogController>(BacklogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
