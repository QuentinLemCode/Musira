import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { JwtGuard } from 'src/auth/jwt.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/user.entity';
import { CurrentMusic, Music, SpotifyOAuthDTO } from './music.interface';
import { QueueEngineService } from './queue/queue-engine/queue-engine.service';
import { QueueService } from './queue/queue.service';
import { SpotifyApiService } from './spotify/spotify-api/spotify-api.service';
import { SpotifySearchService } from './spotify/spotify-search/spotify-search.service';
import {
  SearchResponse,
  TrackObjectFull,
} from './spotify/types/spotify-interfaces';

interface Control {
  start: boolean;
  logout?: boolean;
}
@Controller('music')
export class MusicController {
  constructor(
    private readonly spotify: SpotifyApiService,
    private readonly spotifySearch: SpotifySearchService,
    private readonly queue: QueueService,
    private readonly queueEngine: QueueEngineService,
  ) {}

  @UseGuards(JwtGuard)
  @Get('search')
  async search(@Query('query') query: string): Promise<Music[]> {
    if (!query) throw new BadRequestException('no query');
    const results = await this.spotifySearch.search(query);
    return this.mapResults(results);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('spotify-login')
  spotifyLogin() {
    const state = randomUUID();
    const scope =
      'user-modify-playback-state user-read-playback-state user-read-currently-playing user-read-recently-played user-read-playback-state';

    const url = new URL('https://accounts.spotify.com/authorize');
    const client_id = process.env.SPOTIFY_CLIENT_ID;
    if (!client_id)
      throw new ServiceUnavailableException(
        'Spotify client ID not set on server',
      );

    const params = {
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: this.spotify.redirectUrl,
      state: state,
    };
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return url.toString();
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  async control(@Body() control: Control): Promise<CurrentMusic> {
    if (control.logout) {
      await this.spotify.unregisterPlayer();
      this.queueEngine.stop();
    } else if (control.start) {
      const status = await this.queueEngine.start();
      await new Promise((r) => setTimeout(r, 2000));
      return this.generateState(status.message);
    } else if (control.start === false) {
      this.queueEngine.stop();
    }
    return this.generateState();
  }

  @Get()
  async currentState(): Promise<CurrentMusic> {
    return this.generateState();
  }

  @Post('register-player')
  @UseGuards(JwtGuard)
  @Roles(UserRole.ADMIN)
  async spotifyAuthentication(@Body() spotifyOAuth: SpotifyOAuthDTO) {
    try {
      await this.spotify.registerPlayer(spotifyOAuth.code);
    } catch (error) {
      if (error?.response?.status === 400) {
        throw new BadRequestException({
          spotifyMessage: error.response.data.error,
          isSpotifyAccountRegistered: this.spotify.isAccountRegistered(),
          message: 'Authentification Spotify invalide ou déjà utilisé',
        });
      }
    }
    return this.currentState();
  }

  private mapResults(results: SearchResponse): Music[] {
    return (
      results?.tracks?.items?.map((track) => this.mapTrackItemToMusic(track)) ||
      []
    );
  }

  private mapTrackItemToMusic(track: TrackObjectFull): Music {
    return {
      album: track.album.name,
      artist: track.artists.map((artist) => artist.name).join(', '),
      cover: track.album.images[0].url,
      uri: track.uri,
      title: track.name,
      duration: track.duration_ms,
    };
  }

  private async currentPlay() {
    const response = await this.spotify.getPlaybackState();
    if (response.status === 'error' || !response.data) {
      throw new ServiceUnavailableException();
    }
    const playback = response.data;
    if (!playback.registered) return;
    if (playback.currentPlayback.item?.type !== 'track') return;
    return this.mapTrackItemToMusic(playback.currentPlayback.item);
  }

  private async generateState(message?: string): Promise<CurrentMusic> {
    const isSpotifyAccountRegistered = this.spotify.isAccountRegistered();
    const engineStarted = this.queueEngine.isRunning;
    if (!isSpotifyAccountRegistered) {
      return { isSpotifyAccountRegistered, engineStarted, message };
    }
    const queue = await this.queue.get();
    const currentPlay = (await this.currentPlay()) || null;
    return {
      isSpotifyAccountRegistered,
      queue,
      currentPlay,
      engineStarted,
      message,
    };
  }
}
