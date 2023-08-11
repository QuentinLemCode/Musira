import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { UserRole } from '../../users/user.entity';
import { SettingsService } from './settings.service';
import { MusicSession } from '../entities/music-session.entity';
import { MusicSessionParam } from '../../utils/decorators/music-session.decorator';

export interface SettingsQuery {
  maxVotes: number;
  maxQueuableSongPerUser: number;
}

@Controller('session/:publicCode/settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
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
