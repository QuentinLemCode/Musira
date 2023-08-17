import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { Roles } from '../../users/roles.decorator';
import { UserRole } from '../../users/user.entity';
import { SettingsService } from './settings.service';
import { MusicSession } from '../entities/music-session.entity';
import { MusicSessionParam } from '../../utils/decorators/music-session.decorator';
import { JwtGuard } from '../../users/jwt/jwt.guard';
import { RolesGuard } from '../../users/roles.guard';

export interface SettingsQuery {
  maxVotes: number;
  maxQueuableSongPerUser: number;
}

@Controller('session/:publicCode/settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @UseGuards(JwtGuard, RolesGuard)
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
