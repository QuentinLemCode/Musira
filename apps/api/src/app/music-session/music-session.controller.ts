import type { MusicSessionDto } from '@musira/api-interfaces/index';
import { CreateMusicSessionDto } from '@musira/api-interfaces/sessions/create-music-session.dto';
import type { DeletedMusicSessionDto } from '@musira/api-interfaces/sessions/deleted-music-session.dto';
import { UpdateMusicSessionDto } from '@musira/api-interfaces/sessions/update-music-session.dto';
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
  UseGuards,
} from '@nestjs/common';
import { type JWTPayload } from 'jose';
import { JwtGuard } from '../users/jwt/jwt.guard';
import { Roles } from '../users/roles.decorator';
import { RolesGuard } from '../users/roles.guard';
import { SessionCreatorGuard } from '../users/session-creator.guard';
import { UserRole } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { Jwt } from '../utils/decorators/jwt.decorator';
import {
  MusicSessionParam,
  PublicCode,
} from '../utils/decorators/music-session.decorator';
import { MusicSession } from './entities/music-session.entity';
import { MusicSessionService } from './music-session.service';

@Controller('music-session')
export class MusicSessionController {
  constructor(
    private readonly session: MusicSessionService,
    private readonly users: UsersService,
  ) {}

  @Post()
  @UseGuards(JwtGuard)
  async create(
    @Body() createMusicSessionDto: CreateMusicSessionDto,
    @Jwt() jwt: JWTPayload,
  ): Promise<MusicSessionDto> {
    if (!jwt.email || typeof jwt.email !== 'string')
      throw new ForbiddenException('no jwt');
    const user = await this.users.findByEmail(jwt.email);
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
      creator: createdSession.creator.name,
      linkedToSpotify: createdSession.spotifyAuthUuid !== null,
    };
  }

  @Get()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(): Promise<MusicSessionDto[]> {
    const musicSessions = await this.session.findAll();
    return musicSessions.map((musicSession) => ({
      id: musicSession.id,
      name: musicSession.name,
      code: musicSession.publicCode,
      creator: musicSession.creator.name,
      linkedToSpotify: musicSession.spotifyAuthUuid !== null,
    }));
  }

  @Get(':publicCode')
  async findOne(
    @MusicSessionParam() musicSession: MusicSession,
  ): Promise<MusicSessionDto> {
    return {
      id: musicSession.id,
      name: musicSession.name,
      code: musicSession.publicCode,
      creator: musicSession.creator.name,
      linkedToSpotify: musicSession.spotifyAuthUuid !== null,
    };
  }

  @UseGuards(JwtGuard, SessionCreatorGuard)
  @Patch(':publicCode')
  async update(
    @PublicCode() code: number,
    @Body() updateMusicSessionDto: UpdateMusicSessionDto,
  ): Promise<MusicSessionDto> {
    const musicSession = await this.session.update(code, updateMusicSessionDto);
    return {
      id: musicSession.id,
      name: musicSession.name,
      code: musicSession.publicCode,
      creator: musicSession.creator.name,
      linkedToSpotify: musicSession.spotifyAuthUuid !== null,
    };
  }

  @UseGuards(JwtGuard)
  @Delete(':publicCode')
  async remove(
    @PublicCode() code: number,
    @Jwt() jwt: JWTPayload,
  ): Promise<DeletedMusicSessionDto> {
    if (!jwt.email || typeof jwt.email !== 'string')
      throw new ForbiddenException('no jwt');
    const user = await this.users.findByEmail(jwt.email);
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
}
