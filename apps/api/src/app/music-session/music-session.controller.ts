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
  create(
    @Body() createMusicSessionDto: CreateMusicSessionDto,
    @Req() request: Request,
  ) {
    if (!request.user) throw new ForbiddenException('no jwt');
    return this.musicSessionService.create(
      createMusicSessionDto,
      request.user.userId,
    );
  }

  @Get()
  findAll() {
    return this.musicSessionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.musicSessionService.findOne(this.decodeId(id));
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMusicSessionDto: UpdateMusicSessionDto,
  ) {
    return this.musicSessionService.update(
      this.decodeId(id),
      updateMusicSessionDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.musicSessionService.remove(this.decodeId(id));
  }

  private decodeId(id: string) {
    const [decodedId] = this.hashids.decode(id);
    return Number(decodedId);
  }
}
