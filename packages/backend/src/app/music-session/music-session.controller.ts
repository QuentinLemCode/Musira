
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
import type { CreateMusicSessionDto, DeletedMusicSessionDto, JwtUser, MusicSessionDto, UpdateMusicSessionDto } from '../auth/types';
import { SessionCreatorGuard } from '../users/session-creator.guard';
import { UserRole } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import {
  MusicSessionParam,
  PublicCode,
} from '../utils/decorators/music-session.decorator';
import { MusicSession } from './entities/music-session.entity';
import { MusicSessionService } from './music-session.service';

@ApiTags('Music Sessions')
@ApiBearerAuth()
@Controller('music-session')
export class MusicSessionController {
  constructor(
    private readonly session: MusicSessionService,
    private readonly users: UsersService,
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
      !this.users.isCreatorOfSession(user.email, code)
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
