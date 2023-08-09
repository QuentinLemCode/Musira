import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { MusicSessionService } from './music-session.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MusicSession } from './entities/music-session.entity';
import { User } from '../users/user.email.entity';

describe('MusicSessionService', () => {
  let service: MusicSessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MusicSessionService,
        {
          provide: getRepositoryToken(MusicSession),
          useValue: {
            createQueryBuilder: () => ({}),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            createQueryBuilder: () => ({}),
          },
        },
      ],
    }).compile();

    service = module.get<MusicSessionService>(MusicSessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
