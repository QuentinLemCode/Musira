import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  ServiceUnavailableException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { MusicSession } from '../../music-session/entities/music-session.entity.js';
import { MusicSessionService } from '../../music-session/music-session.service.js';
import { JwtGuard } from '../../users/jwt/jwt.guard.js';
import { SessionCreatorGuard } from '../../users/session-creator.guard.js';
import type { User } from '../../users/user.entity.js';
import { MusicSessionParam } from '../../utils/decorators/music-session.decorator.js';
import { UserFromRequest } from '../../utils/decorators/user-from-request.decorator.js';
import { isResponseError } from '../../utils/type-guards.js';
import { type SpotifyOAuthDTO } from '../music.interface.js';
import { QueueEngineService } from '../queue/queue-engine/queue-engine.service.js';
import { SpotifyApiService } from './spotify-api/spotify-api.service.js';

@Controller('spotify')
export class SpotifyLoginController {
  constructor(
    private readonly spotify: SpotifyApiService,
    private readonly sessions: MusicSessionService,
    private readonly queueEngine: QueueEngineService,
  ) {}

  @UseGuards(JwtGuard, SessionCreatorGuard)
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
  async spotifyAuthentication(
    @Body() spotifyOAuth: SpotifyOAuthDTO,
    @UserFromRequest() user: User,
  ) {
    const [publicCode, state] = spotifyOAuth.state.split('*');
    if (!publicCode)
      throw new BadRequestException('Session public code not found');
    const musicSession = await this.sessions.findOneByPublicCode(+publicCode);
    if (!musicSession) throw new BadRequestException('Session not found');
    if (musicSession.spotifyAuthUuid !== state)
      throw new BadRequestException('Invalid state');

    if (musicSession.creator.id !== user.id)
      throw new UnauthorizedException(
        'Only the session creator can register a player',
      );

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
  @UseGuards(JwtGuard, SessionCreatorGuard)
  async spotifyLogout(@MusicSessionParam() musicSession: MusicSession) {
    await this.spotify.unregisterPlayer(musicSession);
    this.queueEngine.stop();
  }
}
