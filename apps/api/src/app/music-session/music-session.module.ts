import { Module } from '@nestjs/common';
import { MusicSessionController } from './music-session.controller';
import { MusicSessionService } from './music-session.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MusicSession } from './entities/music-session.entity';
import { User } from '../users/user.entity';
import { Settings } from './settings/settings.entity';
import { SettingsController } from './settings/settings.controller';
import { SettingsService } from './settings/settings.service';

@Module({
  imports: [TypeOrmModule.forFeature([MusicSession, User, Settings])],
  controllers: [MusicSessionController, SettingsController],
  providers: [MusicSessionService, SettingsService],
  exports: [MusicSessionService, SettingsService],
})
export class MusicSessionModule {}
