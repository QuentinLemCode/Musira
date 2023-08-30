import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { BacklogService } from './backlog.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Backlog } from './backlog.entity';
import { MusicSessionService } from '../../music-session/music-session.service';

describe('BacklogService', () => {
  let service: BacklogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BacklogService,
        {
          provide: getRepositoryToken(Backlog),
          useValue: {
            createQueryBuilder: () => ({}),
          },
        },
        { provide: MusicSessionService, useValue: {} },
      ],
    }).compile();

    service = module.get<BacklogService>(BacklogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
