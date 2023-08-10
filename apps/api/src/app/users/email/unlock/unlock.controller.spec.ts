import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UnlockController } from './unlock.controller';

describe('UnlockController', () => {
  let controller: UnlockController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnlockController],
    }).compile();

    controller = module.get<UnlockController>(UnlockController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
