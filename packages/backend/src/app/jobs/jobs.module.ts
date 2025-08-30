import { BullModule } from '@nestjs/bullmq';
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MusicModule } from '../music/music.module';
import { SpotifyAccount } from '../music/spotify/spotify-account.entity';
import { SpotifyModule } from '../music/spotify/spotify.module';
import { MusicEngineProcessor } from './processors/music-engine.processor';
import { SpotifyTokenProcessor } from './processors/spotify-token.processor';
import { MUSIC_ENGINE_QUEUE, SPOTIFY_TOKEN_QUEUE } from './queues.constants';

@Module({
  imports: [
    forwardRef(() => MusicModule),
    SpotifyModule,
    TypeOrmModule.forFeature([SpotifyAccount]),
    BullModule.registerQueue(
      { name: MUSIC_ENGINE_QUEUE },
      { name: SPOTIFY_TOKEN_QUEUE },
    ),
  ],
  providers: [MusicEngineProcessor, SpotifyTokenProcessor],
  exports: [BullModule],
})
export class JobsModule {}
