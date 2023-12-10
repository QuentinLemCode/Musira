import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../../users/jwt/jwt.guard.js';
import { SessionCreatorGuard } from '../../users/session-creator.guard.js';
import { MusicSessionParam } from '../../utils/decorators/music-session.decorator.js';
import { MusicSession } from '../entities/music-session.entity.js';
import { SettingsService } from './settings.service.js';

export interface SettingsQuery {
  maxVotes: number;
  maxQueuableSongPerUser: number;
}

@Controller('session/:publicCode/settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @UseGuards(JwtGuard, SessionCreatorGuard)
  @Put()
  async setSettings(
    @MusicSessionParam() musicSession: MusicSession,
    @Body() voteSettings: SettingsQuery,
  ): Promise<SettingsQuery> {
    await this.settings.setMaxVotes(musicSession, voteSettings.maxVotes);
    await this.settings.setMaxQueuableSongPerUser(
      musicSession,
      voteSettings.maxQueuableSongPerUser,
    );
    const settings = await musicSession.settings;
    return {
      maxVotes: settings.maxVotes,
      maxQueuableSongPerUser: settings.maxQueuableSongPerUser,
    };
  }

  @UseGuards(JwtGuard, SessionCreatorGuard)
  @Get()
  async getSettings(
    @MusicSessionParam() musicSession: MusicSession,
  ): Promise<SettingsQuery> {
    const settings = await musicSession.settings;
    return {
      maxVotes: settings.maxVotes,
      maxQueuableSongPerUser: settings.maxQueuableSongPerUser,
    };
  }
}
