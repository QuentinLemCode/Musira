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
import { JwtGuard } from '../../auth/jwt.guard';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { MusicSession } from '../../music-session/entities/music-session.entity';
import { UserRole } from '../../users/user.entity';
import { MusicSessionParam } from '../../utils/decorators/session-hash-id.decorator';
import { SpotifyOAuthDTO } from '../music.interface';
import { SpotifyApiService } from './spotify-api/spotify-api.service';
import { MusicSessionService } from '../../music-session/music-session.service';

@Controller('spotify')
export class SpotifyLoginController {
  constructor(
    private readonly spotify: SpotifyApiService,
    private readonly sessions: MusicSessionService,
  ) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get(':sessionHashId/spotify-login')
  spotifyLogin(@MusicSessionParam() musicSession: MusicSession) {
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
      state: musicSession.hashId + '*' + uuid,
    };
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return url.toString();
  }

  @Post('register-player')
  @UseGuards(JwtGuard)
  @Roles(UserRole.ADMIN)
  async spotifyAuthentication(@Body() spotifyOAuth: SpotifyOAuthDTO) {
    const [sessionHashId, state] = spotifyOAuth.state.split('*');
    const musicSession = await this.sessions.findOneByHashid(sessionHashId);
    if (!musicSession) throw new BadRequestException('Session not found');
    if (musicSession.spotifyAuthUuid !== state)
      throw new BadRequestException('Invalid state');

    try {
      await this.spotify.registerPlayer(musicSession, spotifyOAuth.code);
    } catch (error) {
      if (error?.response?.status === 400) {
        throw new BadRequestException({
          spotifyMessage: error.response.data.error,
          isSpotifyAccountRegistered:
            this.spotify.isAccountRegistered(musicSession),
          message: 'Authentification Spotify invalide ou déjà utilisé',
        });
      }
    }
    return { connected: true, sessionHashId: musicSession.hashId };
  }
}
