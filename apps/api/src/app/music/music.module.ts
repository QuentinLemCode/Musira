import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreModule } from '../core/core.module';
import { MusicController } from './music.controller';
import { Music } from './music.entity';
import { Backlog } from './backlog/backlog.entity';
import { QueueEngineService } from './queue/queue-engine/queue-engine.service';
import { QueueController } from './queue/queue.controller';
import { Queue } from './queue/queue.entity';
import { QueueService } from './queue/queue.service';
import { SpotifyModule } from './spotify/spotify.module';
import { MusicSessionModule } from '../music-session/music-session.module';
import { BacklogService } from './backlog/backlog.service';

@Module({
  imports: [
    SpotifyModule,
    TypeOrmModule.forFeature([Music, Queue, Backlog]),
    CoreModule,
    MusicSessionModule,
  ],
  controllers: [MusicController, QueueController],
  providers: [QueueService, QueueEngineService, BacklogService],
})
export class MusicModule {}
