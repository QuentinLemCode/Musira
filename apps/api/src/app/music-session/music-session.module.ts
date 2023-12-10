import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity.js';
import { MusicSession } from './entities/music-session.entity.js';
import { MusicSessionController } from './music-session.controller.js';
import { MusicSessionService } from './music-session.service.js';
import { SettingsController } from './settings/settings.controller.js';
import { Settings } from './settings/settings.entity.js';
import { SettingsService } from './settings/settings.service.js';
import { MusicSessionPipe } from '../utils/pipes/music-session.pipe.js';
import { PublicCodeGeneratorService } from './public-code-generator/public-code-generator.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([MusicSession, User, Settings])],
  controllers: [MusicSessionController, SettingsController],
  providers: [
    MusicSessionService,
    SettingsService,
    MusicSessionPipe,
    PublicCodeGeneratorService,
  ],
  exports: [SettingsService, MusicSessionService, MusicSessionPipe],
})
export class MusicSessionModule {}
