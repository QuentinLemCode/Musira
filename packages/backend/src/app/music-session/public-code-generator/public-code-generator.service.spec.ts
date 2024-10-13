import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { PublicCodeGeneratorService } from './public-code-generator.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MusicSession } from '../entities/music-session.entity';

const mockRepository = {
  findOneBy: vi.fn(),
};

describe('PublicCodeGeneratorService', () => {
  let service: PublicCodeGeneratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublicCodeGeneratorService,
        {
          provide: getRepositoryToken(MusicSession),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PublicCodeGeneratorService>(
      PublicCodeGeneratorService,
    );
  });

  beforeEach(() => {
    vi.spyOn(global.Math, 'random').mockReturnValue(0.123456789);
  });

  afterEach(() => {
    vi.spyOn(global.Math, 'random').mockRestore();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate a public code', async () => {
    const publicCode = 111111111;
    mockRepository.findOneBy.mockResolvedValue(null);
    const result = await service.generatePublicCode();
    expect(result).toBe(publicCode);
  });

  it('should fail if no code available', () => {
    mockRepository.findOneBy.mockResolvedValue({} as MusicSession);
    expect(service.generatePublicCode()).rejects.toThrowError(
      'Could not generate public code',
    );
  });
});
