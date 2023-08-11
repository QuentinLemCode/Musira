import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { PublicCodeGeneratorService } from './public-code-generator.service';

describe('PublicCodeGeneratorService', () => {
  let service: PublicCodeGeneratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PublicCodeGeneratorService],
    }).compile();

    service = module.get<PublicCodeGeneratorService>(
      PublicCodeGeneratorService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
