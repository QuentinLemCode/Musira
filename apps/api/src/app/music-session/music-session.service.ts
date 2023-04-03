import { CreateMusicSessionDto } from '@musira/api-interfaces/dto/sessions/create-music-session.dto';
import { UpdateMusicSessionDto } from '@musira/api-interfaces/dto/sessions/update-music-session.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { MusicSession } from './entities/music-session.entity';

@Injectable()
export class MusicSessionService {
  constructor(
    @InjectRepository(MusicSession)
    private readonly musicSession: Repository<MusicSession>,
  ) {}

  create(createMusicSessionDto: CreateMusicSessionDto, creator_id: number) {
    const session = this.musicSession.create();
    session.creator = new User();
    session.creator.id = creator_id;
    session.name = createMusicSessionDto.name;
    return this.musicSession.save(session);
  }

  findAll() {
    return this.musicSession.find();
  }

  findOne(id: number) {
    return this.musicSession.findOneBy({ id });
  }

  async update(id: number, updateMusicSessionDto: UpdateMusicSessionDto) {
    const session = await this.musicSession.findOneByOrFail({ id });
    session.name = updateMusicSessionDto.name;
    this.musicSession.save(session);
  }

  remove(id: number) {
    return this.musicSession.delete(id);
  }
}
