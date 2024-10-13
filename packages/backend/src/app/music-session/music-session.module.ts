import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { MusicSession } from './entities/music-session.entity';
import { MusicSessionController } from './music-session.controller';
import { MusicSessionService } from './music-session.service';
import { SettingsController } from './settings/settings.controller';
import { Settings } from './settings/settings.entity';
import { SettingsService } from './settings/settings.service';
import { MusicSessionPipe } from '../utils/pipes/music-session.pipe';
import { PublicCodeGeneratorService } from './public-code-generator/public-code-generator.service';

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
