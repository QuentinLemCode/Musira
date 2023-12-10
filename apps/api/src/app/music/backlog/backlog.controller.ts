import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MusicSession } from '../../music-session/entities/music-session.entity.js';
import { JwtGuard } from '../../users/jwt/jwt.guard.js';
import { Roles } from '../../users/roles.decorator.js';
import { RolesGuard } from '../../users/roles.guard.js';
import { SessionCreatorGuard } from '../../users/session-creator.guard.js';
import { UserRole } from '../../users/user.entity.js';
import { MusicSessionParam } from '../../utils/decorators/music-session.decorator.js';
import { Music } from '../music.entity.js';
import { BacklogService } from './backlog.service.js';

@Controller('session/:publicCode/backlog')
export class BacklogController {
  constructor(private readonly backlog: BacklogService) {}

  @UseGuards(JwtGuard, SessionCreatorGuard)
  @Post()
  pushToBacklog(
    @Body() music: Music,
    @MusicSessionParam() musicSession: MusicSession,
  ) {
    return this.backlog.push(musicSession, music);
  }

  @UseGuards(JwtGuard, SessionCreatorGuard)
  @Delete(':id')
  async deleteBacklog(@Param('id') id: string) {
    try {
      await this.backlog.delete(id);
    } catch (error) {
      throw new NotFoundException();
    }
  }

  @UseGuards(JwtGuard, SessionCreatorGuard)
  @Get('')
  getBackLog(@MusicSessionParam() musicSession: MusicSession) {
    return this.backlog.get(musicSession);
  }

  // TODO: move to its own class
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('import')
  import(
    @Body() importParam: { spotifyPlaylistId: string },
    @MusicSessionParam() musicSession: MusicSession,
  ) {
    return this.backlog.import(importParam.spotifyPlaylistId, musicSession);
  }
}
