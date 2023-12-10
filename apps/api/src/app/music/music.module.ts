import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreModule } from '../core/core.module.js';
import { MusicSessionModule } from '../music-session/music-session.module.js';
import { BacklogController } from './backlog/backlog.controller.js';
import { Backlog } from './backlog/backlog.entity.js';
import { BacklogService } from './backlog/backlog.service.js';
import { MusicController } from './music.controller.js';
import { Music } from './music.entity.js';
import { QueueEngineService } from './queue/queue-engine/queue-engine.service.js';
import { QueueController } from './queue/queue.controller.js';
import { Queue } from './queue/queue.entity.js';
import { QueueService } from './queue/queue.service.js';
import { SpotifyLoginController } from './spotify/spotify-login.controller.js';
import { SpotifyModule } from './spotify/spotify.module.js';

@Module({
  imports: [
    SpotifyModule,
    TypeOrmModule.forFeature([Music, Queue, Backlog]),
    CoreModule,
    MusicSessionModule,
  ],
  controllers: [
    MusicController,
    QueueController,
    BacklogController,
    SpotifyLoginController,
  ],
  providers: [QueueService, QueueEngineService, BacklogService],
})
export class MusicModule {}
