import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MusicSessionModule } from '../../music-session/music-session.module';
import { SpotifyAccount } from './spotify-account.entity';
import { SpotifyApiService } from './spotify-api/spotify-api.service';
import { SpotifySearchService } from './spotify-search/spotify-search.service';

@Module({
  providers: [SpotifyApiService, SpotifySearchService],
  imports: [
    TypeOrmModule.forFeature([SpotifyAccount]),
    HttpModule,
    CacheModule.register(),
    MusicSessionModule,
  ],
  exports: [SpotifyApiService, SpotifySearchService],
})
export class SpotifyModule {}
