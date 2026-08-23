import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Request,
  ServiceUnavailableException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { randomUUID } from 'crypto';
import type { JwtUser } from '../../auth/types';
import { MusicSession } from '../../music-session/entities/music-session.entity';
import { MusicSessionService } from '../../music-session/music-session.service';
import { SessionCreatorGuard } from '../../users/session-creator.guard';
import { MusicSessionParam } from '../../utils/decorators/music-session.decorator';
import { isResponseError } from '../../utils/type-guards';
import { SpotifyOAuthDto } from './dto/spotify-oauth.dto';
import { QueueEngineService } from '../queue/queue-engine/queue-engine.service';
import { SpotifyApiService } from './spotify-api/spotify-api.service';

@ApiTags('Spotify')
@ApiBearerAuth()
@Controller('spotify')
export class SpotifyLoginController {
  constructor(
    private readonly spotify: SpotifyApiService,
    private readonly sessions: MusicSessionService,
    private readonly queueEngine: QueueEngineService,
  ) {}

  @UseGuards(SessionCreatorGuard)
  @Get(':publicCode/spotify-login')
  @ApiOperation({ summary: 'Get Spotify login URL for this session' })
  @ApiParam({ name: 'publicCode', type: Number })
  @ApiOkResponse({ type: String })
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
  @ApiOperation({ summary: 'Register a Spotify player for the session' })
  @ApiCreatedResponse({
    schema: {
      properties: {
        connected: { type: 'boolean' },
        publicCode: { type: 'number' },
      },
    },
  })
  async spotifyAuthentication(
    @Body() spotifyOAuth: SpotifyOAuthDto,
    @Request() req: { user: JwtUser },
  ) {
    const [publicCode, state] = spotifyOAuth.state.split('*');
    if (!publicCode)
      throw new BadRequestException('Session public code not found');
    const musicSession = await this.sessions.findOneByPublicCode(+publicCode);
    if (!musicSession) throw new BadRequestException('Session not found');
    if (musicSession.spotifyAuthUuid !== state)
      throw new BadRequestException('Invalid state');

    if (musicSession.creator.id !== req.user.id)
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
  @UseGuards(SessionCreatorGuard)
  @ApiOperation({ summary: 'Logout Spotify player for this session' })
  @ApiParam({ name: 'publicCode', type: Number })
  async spotifyLogout(@MusicSessionParam() musicSession: MusicSession) {
    await this.spotify.unregisterPlayer(musicSession);
    this.queueEngine.stop();
  }
}
