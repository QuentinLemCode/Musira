import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { UserRole } from '../../users/user.entity';
import { SettingsService } from './settings.service';

export interface SettingsQuery {
  maxVotes: number;
  maxQueuableSongPerUser: number;
}

@Controller('settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put()
  async setSettings(
    @Body() voteSettings: SettingsQuery,
  ): Promise<SettingsQuery> {
    await this.settings.setMaxVotes(voteSettings.maxVotes);
    return {
      maxVotes: this.settings.maxVotes,
      maxQueuableSongPerUser: this.settings.maxQueuableSongPerUser,
    };
  }

  @Get()
  getSettings(): SettingsQuery {
    return {
      maxVotes: this.settings.maxVotes,
      maxQueuableSongPerUser: this.settings.maxQueuableSongPerUser,
    };
  }
}
