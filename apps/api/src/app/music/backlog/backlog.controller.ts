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
import { MusicSession } from '../../music-session/entities/music-session.entity';
import { JwtGuard } from '../../users/jwt/jwt.guard';
import { SessionCreatorGuard } from '../../users/session-creator.guard';
import { MusicSessionParam } from '../../utils/decorators/music-session.decorator';
import { Music } from '../music.entity';
import { BacklogService } from './backlog.service';

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
}
