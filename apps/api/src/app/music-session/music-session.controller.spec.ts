import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { MusicSessionController } from './music-session.controller';
import { MusicSessionService } from './music-session.service';

describe('MusicSessionController', () => {
  let controller: MusicSessionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MusicSessionController],
      providers: [
        {
          provide: MusicSessionService,
          useValue: {
            get: () => undefined,
          },
        },
      ],
    }).compile();

    controller = module.get<MusicSessionController>(MusicSessionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
