import { CreateMusicSessionDto } from '@musira/api-interfaces/sessions/create-music-session.dto';
import { UpdateMusicSessionDto } from '@musira/api-interfaces/sessions/update-music-session.dto';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { hashIdDecode } from '../utils/hashid';
import { MusicSessionService } from './music-session.service';

@Controller('music-session')
export class MusicSessionController {
  constructor(private readonly session: MusicSessionService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Body() createMusicSessionDto: CreateMusicSessionDto,
    @Req() request: Request,
  ) {
    if (!request.user) throw new ForbiddenException('no jwt');
    const createdSession = await this.session.create(
      createMusicSessionDto,
      request.user.userId,
    );
    return {
      name: createdSession.name,
      id: createdSession.hashId,
      creator: createdSession.creator.name,
    };
  }

  @Get()
  async findAll() {
    const musicSessions = await this.session.findAll();
    return musicSessions.map((musicSession) => ({
      name: musicSession.name,
      id: musicSession.hashId,
      creator: musicSession.creator.name,
    }));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const musicSessions = await this.session.findOne(hashIdDecode(id));
    if (!musicSessions) throw new NotFoundException('session not found');
    return {
      name: musicSessions.name,
      id: musicSessions.hashId,
      creator: musicSessions.creator.name,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMusicSessionDto: UpdateMusicSessionDto,
  ) {
    const musicSession = await this.session.update(
      hashIdDecode(id),
      updateMusicSessionDto,
    );
    return {
      name: musicSession.name,
      id: musicSession.hashId,
      creator: musicSession.creator.name,
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.session.remove(hashIdDecode(id));
  }
}
