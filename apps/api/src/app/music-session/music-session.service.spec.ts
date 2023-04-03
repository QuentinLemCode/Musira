import { Test, TestingModule } from '@nestjs/testing';
import { MusicSessionService } from './music-session.service';

describe('MusicSessionService', () => {
  let service: MusicSessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MusicSessionService],
    }).compile();

    service = module.get<MusicSessionService>(MusicSessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
