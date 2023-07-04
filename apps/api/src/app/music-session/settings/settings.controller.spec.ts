import { Test, TestingModule } from '@nestjs/testing';
import { MusicSessionService } from '../music-session.service';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

describe('SettingsController', () => {
  let controller: SettingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingsController],
      providers: [
        {
          provide: SettingsService,
          useValue: {
            maxVotes: { id: 1, maxVotes: 3 },
            setMaxVotes: () => null,
          },
        },
        {
          provide: MusicSessionService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<SettingsController>(SettingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
