import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpotifyAccount } from './spotify-account.entity.js';
import { SpotifyApiService } from './spotify-api/spotify-api.service.js';
import { SpotifySearchService } from './spotify-search/spotify-search.service.js';
import { MusicSessionModule } from '../../music-session/music-session.module.js';

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
