import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { JWTPayload } from 'jose';
import { MusicSession } from '../../music-session/entities/music-session.entity';
import { JwtGuard } from '../../users/jwt/jwt.guard';
import { UserRole } from '../../users/user.entity';
import { UsersService } from '../../users/users.service';
import { Jwt } from '../../utils/decorators/jwt.decorator';
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

  @UseGuards(JwtGuard)
  @Post()
  async pushToQueue(
    @Body() music: Music,
    @Jwt() jwt: JWTPayload,
    @MusicSessionParam() musicSession: MusicSession,
  ) {
    const user = await this.getUser(jwt);
    if (user.role !== UserRole.ADMIN) {
      const settings = await musicSession.settings;
      if (
        (await this.queue.countQueuedItemForUser(user.id)) >=
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
      user.id,
      user.role === UserRole.ADMIN,
    );
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async deleteFromQueue(
    @Param('id') id: string,
    @Jwt() jwt: JWTPayload,
    @MusicSessionParam() musicSession: MusicSession,
  ) {
    const user = await this.getUser(jwt);
    const queuedMusics = await this.users.getQueuedMusicForUser(
      musicSession,
      user.id,
    );
    if (queuedMusics.length === 0) {
      throw new BadRequestException(
        'No queued music on this session for this user or user not found',
      );
    }
    if (
      user.role !== UserRole.ADMIN &&
      queuedMusics.find((m) => m.id === +id) === undefined
    ) {
      throw new ForbiddenException('You are not allowed to delete this music');
    }

    return this.queue.delete(id);
  }

  @UseGuards(JwtGuard)
  @Post('/:id/forward')
  async forwardQueue(
    @Param('id') id: string,
    @Jwt() jwt: JWTPayload,
    @MusicSessionParam() musicSession: MusicSession,
  ) {
    const user = await this.users.findById((await this.getUser(jwt)).id);
    if (user === null) {
      throw new BadRequestException('User not found in database');
    }
    return this.queueEngine.forward(musicSession, id, user);
  }

  private async getUser(jwt: JWTPayload) {
    const email = jwt.email;
    if (!email || typeof email !== 'string') {
      throw new BadRequestException({
        cause: 'user',
        message: 'email not found in jwt',
      });
    }
    const user = await this.users.findByEmail(email);
    if (!user) {
      throw new BadRequestException({
        cause: 'user',
        message: 'user not found',
      });
    }
    return user;
  }
}
