import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { SessionCreatorGuard } from '../../users/session-creator.guard';
import { MusicSessionParam } from '../../utils/decorators/music-session.decorator';
import { MusicSession } from '../entities/music-session.entity';
import { SettingsService } from './settings.service';

export interface SettingsQuery {
  maxVotes: number;
  maxQueuableSongPerUser: number;
}

@ApiTags('Settings')
@ApiBearerAuth()
@ApiParam({ name: 'publicCode', type: Number })
@Controller('session/:publicCode/settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @UseGuards(SessionCreatorGuard)
  @Put()
  @ApiOperation({ summary: 'Update session settings' })
  @ApiOkResponse({
    schema: {
      properties: {
        maxVotes: { type: 'number' },
        maxQueuableSongPerUser: { type: 'number' },
      },
    },
  })
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
  @ApiOperation({ summary: 'Get session settings' })
  @ApiOkResponse({
    schema: {
      properties: {
        maxVotes: { type: 'number' },
        maxQueuableSongPerUser: { type: 'number' },
      },
    },
  })
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
