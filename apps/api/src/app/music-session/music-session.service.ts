import { CreateMusicSessionDto } from '@musira/api-interfaces/sessions/create-music-session.dto';
import { UpdateMusicSessionDto } from '@musira/api-interfaces/sessions/update-music-session.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { hashIdDecode } from '../utils/hashid';
import { MusicSession } from './entities/music-session.entity';
import { Settings } from './settings/settings.entity';

@Injectable()
export class MusicSessionService {
  constructor(
    @InjectRepository(MusicSession)
    private readonly musicSession: Repository<MusicSession>,
    @InjectRepository(User)
    private readonly user: Repository<User>,
  ) {}

  async create(
    createMusicSessionDto: CreateMusicSessionDto,
    creator_id: number,
  ): Promise<MusicSession> {
    const user = await this.user.findOneOrFail({ where: { id: creator_id } });
    const session = this.musicSession.create({
      name: createMusicSessionDto.name,
    });
    session.creator = user;
    session.settings = Promise.resolve(new Settings());
    return this.musicSession.save(session);
  }

  findAll() {
    return this.musicSession.find();
  }

  findOne(id: number): Promise<MusicSession> {
    return this.musicSession.findOne({
      where: { id },
      relations: ['creator'],
    });
  }

  findOneByHashid(hashid: string) {
    return this.musicSession.findOne({
      where: { id: hashIdDecode(hashid) },
      relations: ['creator'],
    });
  }

  getActiveSessions() {
    return this.musicSession.find({
      where: { active: true },
    });
  }

  async setSpotifyAuthUuid(musicSession: MusicSession, uuid: string) {
    musicSession.spotifyAuthUuid = uuid;
    return this.musicSession.save(musicSession);
  }

  async update(
    id: number,
    updateMusicSessionDto: UpdateMusicSessionDto,
  ): Promise<MusicSession> {
    const session = await this.musicSession.findOneOrFail({
      where: { id },
      relations: ['creator'],
    });
    session.name = updateMusicSessionDto.name;
    return this.musicSession.save(session);
  }

  remove(id: number) {
    return this.musicSession.delete({ id });
  }
}
