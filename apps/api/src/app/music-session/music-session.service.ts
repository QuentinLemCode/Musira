import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity.js';
import { MusicSession } from './entities/music-session.entity.js';
import { PublicCodeGeneratorService } from './public-code-generator/public-code-generator.service.js';
import { Settings } from './settings/settings.entity.js';
import type {
  CreateMusicSessionDto,
  UpdateMusicSessionDto,
} from '#api-interfaces/index.js';

@Injectable()
export class MusicSessionService {
  constructor(
    @InjectRepository(MusicSession)
    private readonly musicSession: Repository<MusicSession>,
    @InjectRepository(User)
    private readonly user: Repository<User>,
    @Inject(PublicCodeGeneratorService)
    private readonly publicCodeGenerator: PublicCodeGeneratorService,
  ) {}

  async create(
    createMusicSessionDto: CreateMusicSessionDto,
    creator_id: number,
  ): Promise<MusicSession> {
    const user = await this.user.findOneOrFail({ where: { id: creator_id } });
    const session = this.musicSession.create({
      name: createMusicSessionDto.name,
      publicCode: await this.publicCodeGenerator.generatePublicCode(),
    });
    session.creator = user;
    session.settings = Promise.resolve(new Settings());
    return this.musicSession.save(session);
  }

  findOneByPublicCode(publicCode: number) {
    return this.musicSession.findOne({
      where: { publicCode },
      relations: ['creator'],
    });
  }

  findAll() {
    return this.musicSession.find({
      relations: ['creator'],
    });
  }

  findOne(id: number): Promise<MusicSession | null> {
    return this.musicSession.findOne({
      where: { id },
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
    publicCode: number,
    updateMusicSessionDto: UpdateMusicSessionDto,
  ): Promise<MusicSession> {
    const session = await this.musicSession.findOneOrFail({
      where: { publicCode },
      relations: ['creator'],
    });
    session.name = updateMusicSessionDto.name;
    return this.musicSession.save(session);
  }

  remove(publicCode: number) {
    return this.musicSession.delete({ publicCode });
  }
}
