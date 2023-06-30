import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { SettingsService } from '../../core/settings/settings.service';
import { UserRole } from '../../users/user.entity';
import { UsersService } from '../../users/users.service';
import { Music } from '../music.entity';
import { Backlog } from './backlog.entity';
import { QueueEngineService } from './queue-engine/queue-engine.service';
import { Queue } from './queue.entity';
import { QueueService } from './queue.service';
import { MusicSessionService } from '../../music-session/music-session.service';
import { MusicSessionParam } from '../../utils/decorators/session-hash-id.decorator';
import { MusicSession } from '../../music-session/entities/music-session.entity';

interface QueueResponse {
  queue: Queue[];
  backlog: Backlog | null;
}

@Controller('session/:sessionHashId/queue')
export class QueueController {
  constructor(
    private readonly queue: QueueService,
    private readonly users: UsersService,
    private readonly queueEngine: QueueEngineService,
    private readonly settings: SettingsService,
    private readonly session: MusicSessionService,
  ) {}

  @Get()
  async getQueue(
    @MusicSessionParam() musicSession: MusicSession,
  ): Promise<QueueResponse> {
    const queue = await this.queue.get(musicSession);
    const backlog = await this.queue.getNominatedBacklog();
    return {
      queue,
      backlog,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async pushToQueue(
    @Body() music: Music,
    @Req() req: Request,
    @MusicSessionParam() musicSession: MusicSession,
  ) {
    const user = this.getUser(req);
    if (user.role !== UserRole.ADMIN) {
      if (
        (await this.queue.countQueuedItemForUser(user.userId)) >=
        this.settings.maxQueuableSongPerUser
      ) {
        throw new BadRequestException({
          cause: 'queue-limit',
          limit: this.settings.maxQueuableSongPerUser,
        });
      }
    }
    return this.queue.push(
      musicSession,
      music,
      user.userId,
      user.role === UserRole.ADMIN,
    );
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete(':id')
  async deleteFromQueue(
    @Param('id') id: string,
    @Req() req: Request,
    @MusicSessionParam() musicSession: MusicSession,
  ) {
    const queuedMusics = await this.users.getQueuedMusicForUser(
      this.getUser(req).userId,
    );
    if (queuedMusics === null) {
      throw new BadRequestException('User not found in database');
    }
    if (
      this.getUser(req).role !== UserRole.ADMIN &&
      queuedMusics.find((m) => m.id === +id) === undefined
    ) {
      throw new ForbiddenException('You are not allowed to delete this music');
    }

    return this.queue.delete(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('backlog')
  pushToBacklog(
    @Body() music: Music,
    @MusicSessionParam() musicSession: MusicSession,
  ) {
    return this.queue.pushBacklog(music);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('backlog/:id')
  deleteBacklog(
    @Param('id') id: string,
    @MusicSessionParam() musicSession: MusicSession,
  ) {
    return this.queue.deleteBacklog(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('backlog')
  getBackLog(@MusicSessionParam() musicSession: MusicSession) {
    return this.queue.getBacklog();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/:id/forward')
  async forwardQueue(
    @Param('id') id: string,
    @Req() req: Request,
    @MusicSessionParam() musicSession: MusicSession,
  ) {
    const user = await this.users.findById(this.getUser(req).userId);
    if (user === null) {
      throw new BadRequestException('User not found in database');
    }
    return this.queueEngine.forward(musicSession, id, user);
  }

  private getUser(req: Request) {
    const user = req.user;
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }
}
