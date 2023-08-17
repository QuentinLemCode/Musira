import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MusicSession } from '../../music-session/entities/music-session.entity';
import { JwtGuard } from '../../users/jwt/jwt.guard';
import { Roles } from '../../users/roles.decorator';
import { RolesGuard } from '../../users/roles.guard';
import { UserRole } from '../../users/user.entity';
import { MusicSessionParam } from '../../utils/decorators/music-session.decorator';
import { Music } from '../music.entity';
import { BacklogService } from './backlog.service';

@Controller('session/:publicCode/backlog')
export class BacklogController {
  constructor(private readonly backlog: BacklogService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  pushToBacklog(
    @Body() music: Music,
    @MusicSessionParam() musicSession: MusicSession,
  ) {
    return this.backlog.push(musicSession, music);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  deleteBacklog(@Param('id') id: string) {
    return this.backlog.delete(id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('')
  getBackLog(@MusicSessionParam() musicSession: MusicSession) {
    return this.backlog.get(musicSession);
  }
}
