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

interface QueueResponse {
  queue: Queue[];
  backlog: Backlog | null;
}

@Controller('queue')
export class QueueController {
  constructor(
    private readonly queue: QueueService,
    private readonly users: UsersService,
    private readonly queueEngine: QueueEngineService,
    private readonly settings: SettingsService,
  ) {}

  @Get()
  async getQueue(): Promise<QueueResponse> {
    const queue = await this.queue.get();
    const backlog = await this.queue.getNominatedBacklog();
    return {
      queue,
      backlog,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async pushToQueue(@Body() music: Music, @Req() req: Request) {
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
    return this.queue.push(music, user.userId, user.role === UserRole.ADMIN);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete(':id')
  async deleteFromQueue(@Param('id') id: string, @Req() req: Request) {
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
  pushToBacklog(@Body() music: Music) {
    return this.queue.pushBacklog(music);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('backlog/:id')
  deleteBacklog(@Param('id') id: string) {
    return this.queue.deleteBacklog(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('backlog')
  getBackLog() {
    return this.queue.getBacklog();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/:id/forward')
  async forwardQueue(@Param('id') id: string, @Req() req: Request) {
    const user = await this.users.findById(this.getUser(req).userId);
    if (user === null) {
      throw new BadRequestException('User not found in database');
    }
    return this.queueEngine.forward(id, user);
  }

  private getUser(req: Request) {
    const user = req.user;
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }
}
