import type { MusicSessionDto } from '@musira/api-interfaces/index';
import { CreateMusicSessionDto } from '@musira/api-interfaces/sessions/create-music-session.dto';
import { UpdateMusicSessionDto } from '@musira/api-interfaces/sessions/update-music-session.dto';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import {
  MusicSessionParam,
  PublicCode,
} from '../utils/decorators/music-session.decorator';
import { MusicSession } from './entities/music-session.entity';
import { MusicSessionService } from './music-session.service';

@Controller('music-session')
export class MusicSessionController {
  constructor(private readonly session: MusicSessionService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Body() createMusicSessionDto: CreateMusicSessionDto,
    @Req() request: Request,
  ): Promise<MusicSessionDto> {
    if (!request.user) throw new ForbiddenException('no jwt');
    const createdSession = await this.session.create(
      createMusicSessionDto,
      request.user.userId,
    );
    return {
      name: createdSession.name,
      code: createdSession.publicCode,
      creator: createdSession.creator.name,
    };
  }

  @Get()
  async findAll() {
    const musicSessions = await this.session.findAll();
    return musicSessions.map((musicSession) => ({
      name: musicSession.name,
      code: musicSession.publicCode,
      creator: musicSession.creator.name,
    }));
  }

  @Get(':publicCode')
  async findOne(@MusicSessionParam() musicSession: MusicSession) {
    return {
      name: musicSession.name,
      code: musicSession.publicCode,
      creator: musicSession.creator.name,
    };
  }

  @Patch(':publicCode')
  async update(
    @PublicCode() code: number,
    @Body() updateMusicSessionDto: UpdateMusicSessionDto,
  ) {
    const musicSession = await this.session.update(code, updateMusicSessionDto);
    return {
      name: musicSession.name,
      code: musicSession.publicCode,
      creator: musicSession.creator.name,
    };
  }

  @Delete(':publicCode')
  remove(@PublicCode() code: number) {
    return this.session.remove(code);
  }
}
