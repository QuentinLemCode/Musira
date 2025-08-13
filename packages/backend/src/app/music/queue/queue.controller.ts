import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../auth/public-routes.decorator';
import type { JwtUser } from '../../auth/types';
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

@ApiTags('Queue')
@ApiBearerAuth()
@ApiParam({ name: 'publicCode', type: Number })
@Controller('session/:publicCode/queue')
export class QueueController {
  constructor(
    private readonly queue: QueueService,
    private readonly users: UsersService,
    private readonly queueEngine: QueueEngineService,
    private readonly backlog: BacklogService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get queue and nominated backlog for a session' })
  async getQueue(
    @MusicSessionParam() musicSession: MusicSession,
  ): Promise<QueueResponse> {
    const queue = await this.queue.getPending(musicSession);
    const backlog = await this.backlog.getNominatedBacklog(musicSession);
    return {
      queue,
      backlog,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Push a music to the queue' })
  async pushToQueue(
    @Body() music: Music,
    @Request() req: { user: JwtUser },
    @MusicSessionParam() musicSession: MusicSession,
  ) {
    const user = await this.users.findByEmail(req.user.email);
    if (!user) {
      throw new BadRequestException('User not found in database');
    }
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

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a music from the queue' })
  @ApiParam({ name: 'id', type: String })
  async deleteFromQueue(
    @Param('id') id: string,
    @Request() req: { user: JwtUser },
    @MusicSessionParam() musicSession: MusicSession,
  ) {
    const user = await this.users.findByEmail(req.user.email);
    if (!user) {
      throw new BadRequestException('User not found in database');
    }
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

  @Post('/:id/forward')
  @ApiOperation({ summary: 'Forward a queued music (move up)' })
  @ApiParam({ name: 'id', type: String })
  async forwardQueue(
    @Param('id') id: string,
    @Request() req: { user: JwtUser },
    @MusicSessionParam() musicSession: MusicSession,
  ) {
    const user = await this.users.findByEmail(req.user.email);
    if (user === null) {
      throw new BadRequestException('User not found in database');
    }
    return this.queueEngine.forward(musicSession, id, user);
  }
}
