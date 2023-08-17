import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { MusicSession } from '../../music-session/entities/music-session.entity';
import { MusicSessionService } from '../../music-session/music-session.service';
import { JwtGuard } from '../../users/jwt/jwt.guard';
import { MusicSessionParam } from '../../utils/decorators/music-session.decorator';
import { isResponseError } from '../../utils/type-guards';
import { SpotifyOAuthDTO } from '../music.interface';
import { QueueEngineService } from '../queue/queue-engine/queue-engine.service';
import { SpotifyApiService } from './spotify-api/spotify-api.service';

@Controller('spotify')
export class SpotifyLoginController {
  constructor(
    private readonly spotify: SpotifyApiService,
    private readonly sessions: MusicSessionService,
    private readonly queueEngine: QueueEngineService,
  ) {}

  // TODO : implement session creator guard
  @UseGuards(JwtGuard)
  @Get(':publicCode/spotify-login')
  async spotifyLogin(@MusicSessionParam() musicSession: MusicSession) {
    const uuid = randomUUID();
    this.sessions.setSpotifyAuthUuid(musicSession, uuid);
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
      state: musicSession.publicCode + '*' + uuid,
    };
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return url.toString();
  }

  @Post('register-player')
  @UseGuards(JwtGuard)
  async spotifyAuthentication(@Body() spotifyOAuth: SpotifyOAuthDTO) {
    const [publicCode, state] = spotifyOAuth.state.split('*');
    if (!publicCode)
      throw new BadRequestException('Session public code not found');
    const musicSession = await this.sessions.findOneByPublicCode(+publicCode);
    if (!musicSession) throw new BadRequestException('Session not found');
    if (musicSession.spotifyAuthUuid !== state)
      throw new BadRequestException('Invalid state');

    try {
      await this.spotify.registerPlayer(musicSession, spotifyOAuth.code);
    } catch (error) {
      if (isResponseError(error) && error?.response?.status === 400) {
        throw new BadRequestException({
          spotifyMessage: error.response.data.error,
          isSpotifyAccountRegistered:
            this.spotify.isAccountRegistered(musicSession),
          message: 'Authentification Spotify invalide ou déjà utilisé',
        });
      }
    }
    return { connected: true, publicCode: musicSession.publicCode };
  }

  @Post(':publicCode/logout-player')
  @UseGuards(JwtGuard)
  async spotifyLogout(@MusicSessionParam() musicSession: MusicSession) {
    await this.spotify.unregisterPlayer(musicSession);
    this.queueEngine.stop();
  }
}
