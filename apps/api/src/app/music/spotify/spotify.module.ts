import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpotifyAccount } from './spotify-account.entity';
import { SpotifyApiService } from './spotify-api/spotify-api.service';
import { SpotifySearchService } from './spotify-search/spotify-search.service';

@Module({
  providers: [SpotifyApiService, SpotifySearchService],
  imports: [TypeOrmModule.forFeature([SpotifyAccount]), HttpModule],
  exports: [SpotifyApiService, SpotifySearchService],
})
export class SpotifyModule {}
