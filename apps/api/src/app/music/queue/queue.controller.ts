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
import { RolesGuard } from '../../auth/roles.guard';
import { MusicSession } from '../../music-session/entities/music-session.entity';
import { UserRole } from '../../users/user.entity';
import { UsersService } from '../../users/users.service';
import { MusicSessionParam } from '../../utils/decorators/music-session.decorator';
import type { Backlog } from '../backlog/backlog.entity';
import { BacklogService } from '../backlog/backlog.service';
import { Music } from '../music.entity';
import { QueueEngineService } from './queue-engine/queue-engine.service';
import type { Queue } from './queue.entity';
import { QueueService } from './queue.service';

interface QueueResponse {
  queue: Queue[];
  backlog: Backlog | null | undefined;
}

@Controller('session/:publicCode/queue')
export class QueueController {
  constructor(
    private readonly queue: QueueService,
    private readonly users: UsersService,
    private readonly queueEngine: QueueEngineService,
    private readonly backlog: BacklogService,
  ) {}

  @Get()
  async getQueue(
    @MusicSessionParam() musicSession: MusicSession,
  ): Promise<QueueResponse> {
    const queue = await this.queue.get(musicSession);
    const backlog = await this.backlog.getNominatedBacklog(musicSession);
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
      const settings = await musicSession.settings;
      if (
        (await this.queue.countQueuedItemForUser(user.userId)) >=
        settings.maxQueuableSongPerUser
      ) {
        throw new BadRequestException({
          cause: 'queue-limit',
          limit: settings.maxQueuableSongPerUser,
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
    const user = this.getUser(req);
    const queuedMusics = await this.users.getQueuedMusicForUser(
      musicSession,
      user.userId,
    );
    if (queuedMusics.length === 0) {
      throw new BadRequestException(
        'No queued music on this session for this user or user not found',
      );
    }
    if (
      this.getUser(req).role !== UserRole.ADMIN &&
      queuedMusics.find((m) => m.id === +id) === undefined
    ) {
      throw new ForbiddenException('You are not allowed to delete this music');
    }

    return this.queue.delete(id);
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
