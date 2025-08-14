import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { MusicSessionPipe } from '../utils/pipes/music-session.pipe';
import { MusicSession } from './entities/music-session.entity';
import { SessionHistory } from './entities/session-history.entity';
import { MusicSessionController } from './music-session.controller';
import { MusicSessionService } from './music-session.service';
import { PublicCodeGeneratorService } from './public-code-generator/public-code-generator.service';
import { SessionHistoryService } from './session-history.service';
import { SettingsController } from './settings/settings.controller';
import { Settings } from './settings/settings.entity';
import { SettingsService } from './settings/settings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MusicSession, User, Settings, SessionHistory]),
  ],
  controllers: [MusicSessionController, SettingsController],
  providers: [
    MusicSessionService,
    SettingsService,
    MusicSessionPipe,
    PublicCodeGeneratorService,
    SessionHistoryService,
  ],
  exports: [
    SettingsService,
    MusicSessionService,
    MusicSessionPipe,
    SessionHistoryService,
  ],
})
export class MusicSessionModule {}
