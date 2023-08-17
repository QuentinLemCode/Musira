import type { MusicSessionDto } from '@musira/api-interfaces/index';
import { CreateMusicSessionDto } from '@musira/api-interfaces/sessions/create-music-session.dto';
import { UpdateMusicSessionDto } from '@musira/api-interfaces/sessions/update-music-session.dto';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JWTPayload } from 'jose';
import { JwtGuard } from '../users/jwt/jwt.guard';
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
      name: createdSession.name,
      code: createdSession.publicCode,
      creator: createdSession.creator.name,
      linkedToSpotify: createdSession.spotifyAuthUuid !== null,
    };
  }

  @Get()
  async findAll(): Promise<MusicSessionDto[]> {
    const musicSessions = await this.session.findAll();
    return musicSessions.map((musicSession) => ({
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
      name: musicSession.name,
      code: musicSession.publicCode,
      creator: musicSession.creator.name,
      linkedToSpotify: musicSession.spotifyAuthUuid !== null,
    };
  }

  @Patch(':publicCode')
  async update(
    @PublicCode() code: number,
    @Body() updateMusicSessionDto: UpdateMusicSessionDto,
  ): Promise<MusicSessionDto> {
    const musicSession = await this.session.update(code, updateMusicSessionDto);
    return {
      name: musicSession.name,
      code: musicSession.publicCode,
      creator: musicSession.creator.name,
      linkedToSpotify: musicSession.spotifyAuthUuid !== null,
    };
  }

  @Delete(':publicCode')
  remove(@PublicCode() code: number) {
    return this.session.remove(code);
  }
}
