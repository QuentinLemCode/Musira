import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MusicSessionService } from './music-session.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { CreateMusicSessionDto } from '@musira/api-interfaces/sessions/create-music-session.dto';
import { UpdateMusicSessionDto } from '@musira/api-interfaces/sessions/update-music-session.dto';
import Hashids from 'hashids/cjs/hashids';
@Controller('music-session')
export class MusicSessionController {
  private hashids: Hashids;
  constructor(private readonly musicSessionService: MusicSessionService) {
    this.hashids = new Hashids('musira', 8);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Body() createMusicSessionDto: CreateMusicSessionDto,
    @Req() request: Request,
  ) {
    if (!request.user) throw new ForbiddenException('no jwt');
    const createdSession = await this.musicSessionService.create(
      createMusicSessionDto,
      request.user.userId,
    );
    return {
      name: createdSession.name,
      id: this.encodeId(createdSession.id),
      creator: createdSession.creator.name,
    };
  }

  @Get()
  findAll() {
    return this.musicSessionService.findAll().then((music_sessions) =>
      music_sessions.map((music_session) => ({
        name: music_session.name,
        id: this.encodeId(music_session.id),
        creator: music_session.creator.name,
      })),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const music_session = await this.musicSessionService.findOne(
      this.decodeId(id),
    );
    return {
      name: music_session.name,
      id: this.encodeId(music_session.id),
      creator: music_session.creator.name,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMusicSessionDto: UpdateMusicSessionDto,
  ) {
    const music_session = await this.musicSessionService.update(
      this.decodeId(id),
      updateMusicSessionDto,
    );
    return {
      name: music_session.name,
      id: this.encodeId(music_session.id),
      creator: music_session.creator.name,
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.musicSessionService.remove(this.decodeId(id));
  }

  private decodeId(id: string) {
    const [decodedId] = this.hashids.decode(id);
    return Number(decodedId);
  }

  private encodeId(id: number) {
    return this.hashids.encode(id);
  }
}
