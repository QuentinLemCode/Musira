import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../auth/public-routes.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type {
  CreateMusicSessionDto,
  DeletedMusicSessionDto,
  JwtUser,
  MusicSessionDto,
  UpdateMusicSessionDto,
} from '../auth/types';
import { SessionCreatorGuard } from '../users/session-creator.guard';
import { UserRole } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import {
  MusicSessionParam,
  PublicCode,
} from '../utils/decorators/music-session.decorator';
import { MusicSession } from './entities/music-session.entity';
import { MusicSessionService } from './music-session.service';
import { SessionHistoryService } from './session-history.service';

@ApiTags('Music Sessions')
@ApiBearerAuth()
@Controller('music-session')
export class MusicSessionController {
  constructor(
    private readonly session: MusicSessionService,
    private readonly users: UsersService,
    private readonly sessionHistory: SessionHistoryService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new music session' })
  async create(
    @Body() createMusicSessionDto: CreateMusicSessionDto,
    @Request() req: { user: JwtUser },
  ) {
    if (!req.user.email) throw new ForbiddenException('no jwt');
    const user = await this.users.findByEmail(req.user.email);
    if (!user) {
      throw new BadRequestException({
        cause: 'user',
        message: 'user not found',
      });
    }

    const createdSession = await this.session.create(
      createMusicSessionDto,
      user.id,
    );
    return {
      id: createdSession.id,
      name: createdSession.name,
      code: createdSession.publicCode,
      creator: createdSession.creator.name ?? '',
      linkedToSpotify: createdSession.spotifyAuthUuid !== null,
      isCreator: this.isSessionCreator(user.id, createdSession),
    };
  }

  @Get()
  @ApiOperation({ summary: 'List all music sessions (admin only)' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(@Request() req: { user: JwtUser }): Promise<MusicSessionDto[]> {
    const musicSessions = await this.session.findAll();
    return musicSessions.map((musicSession) => ({
      id: musicSession.id,
      name: musicSession.name,
      code: musicSession.publicCode,
      creator: musicSession.creator.name ?? '',
      linkedToSpotify: musicSession.spotifyAuthUuid !== null,
      isCreator: this.isSessionCreator(req.user.id, musicSession),
    }));
  }

  @Public()
  @Get(':publicCode')
  @ApiOperation({ summary: 'Get a session by public code' })
  @ApiParam({ name: 'publicCode', type: Number })
  async findOne(
    @MusicSessionParam() musicSession: MusicSession,
    @Request() req: { user?: JwtUser },
  ): Promise<MusicSessionDto> {
    if (req.user?.id) {
      await this.sessionHistory.recordJoin(req.user.id, musicSession);
    }
    return {
      id: musicSession.id,
      name: musicSession.name,
      code: musicSession.publicCode,
      creator: musicSession.creator.name ?? '',
      linkedToSpotify: musicSession.spotifyAuthUuid !== null,
      isCreator: req.user
        ? this.isSessionCreator(req.user.id, musicSession)
        : false,
    };
  }

  @Get('history/me')
  @ApiOperation({ summary: 'Get current user session history' })
  async getMyHistory(@Request() req: { user: JwtUser }) {
    const [entries, createdByMe] = await Promise.all([
      this.sessionHistory.getHistoryForUser(req.user.id),
      this.session.findCreatedByUser(req.user.id),
    ]);

    const mappedHistory = entries.map((entry) => ({
      access_date: entry.joined_at,
      musicSession: {
        id: entry.music_session.id,
        name: entry.music_session.name,
        code: entry.music_session.publicCode,
        creator: entry.music_session.creator?.name ?? '',
        linkedToSpotify: entry.music_session.spotifyAuthUuid !== null,
        isCreator: req.user.id === entry.music_session.creator?.id,
      },
    }));

    const mappedCreated = createdByMe.map((s) => ({
      access_date: s.created_at,
      musicSession: {
        id: s.id,
        name: s.name,
        code: s.publicCode,
        creator: s.creator?.name ?? '',
        linkedToSpotify: s.spotifyAuthUuid !== null,
        isCreator: true,
      },
    }));

    const mergedMap = new Map<
      number,
      { access_date: Date; musicSession: any }
    >();
    for (const item of [...mappedHistory, ...mappedCreated]) {
      const code = item.musicSession.code;
      const existing = mergedMap.get(code);
      if (
        !existing ||
        new Date(item.access_date) > new Date(existing.access_date)
      ) {
        mergedMap.set(code, item);
      }
    }
    // Return sorted by date desc
    return Array.from(mergedMap.values()).sort(
      (a, b) =>
        new Date(b.access_date).getTime() - new Date(a.access_date).getTime(),
    );
  }

  @UseGuards(SessionCreatorGuard)
  @Patch(':publicCode')
  @ApiOperation({ summary: 'Update a session (creator only)' })
  @ApiParam({ name: 'publicCode', type: Number })
  async update(
    @Request() req: { user: JwtUser },
    @PublicCode() code: number,
    @Body() updateMusicSessionDto: UpdateMusicSessionDto,
  ): Promise<MusicSessionDto> {
    const musicSession = await this.session.update(code, updateMusicSessionDto);
    return {
      id: musicSession.id,
      name: musicSession.name,
      code: musicSession.publicCode,
      creator: musicSession.creator.name ?? '',
      linkedToSpotify: musicSession.spotifyAuthUuid !== null,
      isCreator: this.isSessionCreator(req.user.id, musicSession),
    };
  }

  @Delete(':publicCode')
  @ApiOperation({ summary: 'Delete a session (admin or creator)' })
  @ApiParam({ name: 'publicCode', type: Number })
  async remove(
    @PublicCode() code: number,
    @Request() req: { user: JwtUser },
  ): Promise<DeletedMusicSessionDto> {
    const user = await this.users.findByEmail(req.user.email);
    if (!user) {
      throw new BadRequestException({
        cause: 'user',
        message: 'user not found',
      });
    }
    if (
      user.role !== UserRole.ADMIN &&
      !(await this.users.isCreatorOfSession(user.email, code))
    ) {
      throw new ForbiddenException({
        cause: 'not-creator',
        message: 'You are not the creator of the session',
      });
    }
    const result = await this.session.remove(code);
    if (result.affected !== 1)
      throw new NotFoundException({
        cause: 'not-found',
        message: 'session not found',
      });
    return { deleted: true, publicCode: code };
  }

  private isSessionCreator(
    userId: number,
    musicSession: MusicSession,
  ): boolean {
    return userId === musicSession.creator.id;
  }
}
