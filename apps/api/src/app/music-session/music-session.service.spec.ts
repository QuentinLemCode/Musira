import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { MusicSession } from './entities/music-session.entity';
import { MusicSessionService } from './music-session.service';
import { PublicCodeGeneratorService } from './public-code-generator/public-code-generator.service';
import { CreateMusicSessionDto } from '@musira/api-interfaces';

// Mocking Repositories and Services
const mockRepository = {
  create: jest.fn(),
  findOneOrFail: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

const mockPublicCodeGeneratorService = {
  generatePublicCode: jest.fn(),
};

describe('MusicSessionService', () => {
  let service: MusicSessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MusicSessionService,
        {
          provide: getRepositoryToken(MusicSession),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: PublicCodeGeneratorService,
          useValue: mockPublicCodeGeneratorService,
        },
      ],
    }).compile();

    service = module.get<MusicSessionService>(MusicSessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a music session', async () => {
      const createDto: CreateMusicSessionDto = {
        name: 'toto',
      }; // Provide valid DTO here
      const creatorId = 1;
      const user = new User();
      mockRepository.findOneOrFail.mockResolvedValue(user);
      mockRepository.create.mockReturnValue({ name: 'toto' });
      mockRepository.save.mockResolvedValue({ name: 'toto' });

      const result = await service.create(createDto, creatorId);

      expect(result).toBeDefined();
    });
  });
});
