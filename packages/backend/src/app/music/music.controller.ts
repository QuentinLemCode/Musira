import {
  BadRequestException,
  Controller,
  Get,
  Query,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../auth/public-routes.decorator';
import { MusicSession } from '../music-session/entities/music-session.entity';
import { SessionCreatorGuard } from '../users/session-creator.guard';
import { MusicSessionParam } from '../utils/decorators/music-session.decorator';
import { CurrentMusicDto } from './dto/current-music.dto';
import { MusicDto } from './dto/music.dto';
import type { CurrentMusic, Music } from './music.interface';
import { QueueEngineService } from './queue/queue-engine/queue-engine.service';
import { QueueService } from './queue/queue.service';
import { SpotifyApiService } from './spotify/spotify-api/spotify-api.service';
import { SpotifySearchService } from './spotify/spotify-search/spotify-search.service';
import type {
  SearchResponse,
  TrackObjectFull,
} from './spotify/types/spotify-interfaces';

@ApiTags('Music')
@ApiBearerAuth()
@ApiParam({ name: 'publicCode', type: Number })
@Controller('session/:publicCode/music')
export class MusicController {
  constructor(
    private readonly spotify: SpotifyApiService,
    private readonly spotifySearch: SpotifySearchService,
    private readonly queue: QueueService,
    private readonly queueEngine: QueueEngineService,
  ) {}

  @Get('search')
  @ApiOperation({ summary: 'Search music on Spotify for this session' })
  @ApiQuery({ name: 'query', required: true, type: String })
  @ApiOkResponse({ type: MusicDto, isArray: true })
  async search(@Query('query') query: string): Promise<Music[]> {
    if (!query) throw new BadRequestException('no query');
    const results = await this.spotifySearch.search(query);
    return this.mapResults(results);
  }

  @UseGuards(SessionCreatorGuard)
  @Get('start')
  @ApiOkResponse({ type: CurrentMusicDto })
  async start(
    @MusicSessionParam() musicSession: MusicSession,
  ): Promise<CurrentMusic> {
    const status = await this.queueEngine.start(musicSession);
    await new Promise((r) => setTimeout(r, 2000));
    return this.generateState(musicSession, status.message);
  }

  @UseGuards(SessionCreatorGuard)
  @Get('stop')
  @ApiOkResponse({ type: CurrentMusicDto })
  async stop(
    @MusicSessionParam() musicSession: MusicSession,
  ): Promise<CurrentMusic> {
    this.queueEngine.stop();
    return this.generateState(musicSession);
  }

  @Public()
  @Get()
  @ApiOkResponse({ type: CurrentMusicDto })
  async currentState(
    @MusicSessionParam() musicSession: MusicSession,
  ): Promise<CurrentMusic> {
    return this.generateState(musicSession);
  }

  private mapResults(results: SearchResponse): Music[] {
    return (
      results?.tracks?.items
        ?.filter((track) => track.is_playable)
        .map((track) => this.mapTrackItemToMusic(track)) || []
    );
  }

  private mapTrackItemToMusic(track: TrackObjectFull): Music {
    return {
      album: track.album.name,
      artist: track.artists.map((artist) => artist.name).join(', '),
      cover: track.album?.images?.[0]?.url,
      uri: track.uri,
      title: track.name,
      duration: track.duration_ms,
    };
  }

  private async currentPlay(musicSession: MusicSession) {
    const response = await this.spotify.getPlaybackState(musicSession);
    if (response.status === 'error' || !response.data) {
      throw new ServiceUnavailableException();
    }
    const playback = response.data;
    if (!playback.registered) return null;
    if (playback.currentPlayback?.item?.type !== 'track') return null;
    return this.mapTrackItemToMusic(playback.currentPlayback.item);
  }

  private async generateState(
    musicSession: MusicSession,
    message?: string,
  ): Promise<CurrentMusic> {
    const isSpotifyAccountRegistered =
      await this.spotify.isAccountRegistered(musicSession);
    const engineStarted = this.queueEngine.isRunning;
    if (!isSpotifyAccountRegistered) {
      return { isSpotifyAccountRegistered, engineStarted, message };
    }
    const queue = await this.queue.get(musicSession);
    const currentPlay = engineStarted
      ? await this.currentPlay(musicSession)
      : null;
    return {
      isSpotifyAccountRegistered,
      queue,
      currentPlay,
      engineStarted,
      message,
    };
  }
}
