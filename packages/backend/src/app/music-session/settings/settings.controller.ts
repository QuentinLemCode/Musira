import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { SessionCreatorGuard } from '../../users/session-creator.guard';
import { MusicSessionParam } from '../../utils/decorators/music-session.decorator';
import { MusicSession } from '../entities/music-session.entity';
import { SettingsService } from './settings.service';

export interface SettingsQuery {
  maxVotes: number;
  maxQueuableSongPerUser: number;
}

@Controller('session/:publicCode/settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @UseGuards(SessionCreatorGuard)
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

  @UseGuards(SessionCreatorGuard)
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
