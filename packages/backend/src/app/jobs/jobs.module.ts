import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { MusicEngineProcessor } from './processors/music-engine.processor';
import { SpotifyTokenProcessor } from './processors/spotify-token.processor';

export const MUSIC_ENGINE_QUEUE = 'music-engine';
export const SPOTIFY_TOKEN_QUEUE = 'spotify-token';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: MUSIC_ENGINE_QUEUE },
      { name: SPOTIFY_TOKEN_QUEUE },
    ),
  ],
  providers: [MusicEngineProcessor, SpotifyTokenProcessor],
  exports: [BullModule],
})
export class JobsModule {}
