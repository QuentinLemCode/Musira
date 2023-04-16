import { CreateMusicSessionDto } from '@musira/api-interfaces/sessions/create-music-session.dto';
import { UpdateMusicSessionDto } from '@musira/api-interfaces/sessions/update-music-session.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { MusicSession } from './entities/music-session.entity';
import Hashids from 'hashids/cjs/hashids';
import { MusicSessionDto } from '@musira/api-interfaces/sessions/music-session.dto';

@Injectable()
export class MusicSessionService {
  private hashids: Hashids;
  constructor(
    @InjectRepository(MusicSession)
    private readonly musicSession: Repository<MusicSession>,
  ) {
    this.hashids = new Hashids('musira', 8);
  }

  async create(
    createMusicSessionDto: CreateMusicSessionDto,
    creator_id: number,
  ): Promise<MusicSessionDto> {
    const session = this.musicSession.create();
    session.creator = new User();
    session.creator.id = creator_id;
    session.name = createMusicSessionDto.name;
    const createdSession = await this.musicSession.save(session);
    return {
      name: createdSession.name,
      id: this.encodeId(createdSession.id),
    };
  }

  findAll() {
    return this.musicSession.find();
  }

  async findOne(id: string): Promise<MusicSessionDto> {
    const session = await this.musicSession.findOneBy({
      id: this.decodeId(id),
    });
    return {
      name: session.name,
      id: this.encodeId(session.id),
    };
  }

  async update(
    id: string,
    updateMusicSessionDto: UpdateMusicSessionDto,
  ): Promise<MusicSessionDto> {
    const session = await this.musicSession.findOneByOrFail({
      id: this.decodeId(id),
    });
    session.name = updateMusicSessionDto.name;
    this.musicSession.save(session);
    return {
      name: session.name,
      id: this.encodeId(session.id),
    };
  }

  remove(id: string) {
    return this.musicSession.delete({ id: this.decodeId(id) });
  }

  private decodeId(id: string) {
    const [decodedId] = this.hashids.decode(id);
    return Number(decodedId);
  }

  private encodeId(id: number) {
    return this.hashids.encode(id);
  }
}
