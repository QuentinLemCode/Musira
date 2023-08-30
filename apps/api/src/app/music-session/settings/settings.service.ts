import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { MusicSession } from '../entities/music-session.entity';
import { Settings } from './settings.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Settings)
    private readonly settings: Repository<Settings>,
  ) {}

  async setMaxVotes(musicSession: MusicSession, value: number) {
    const settings = await musicSession.settings;
    settings.maxVotes = value;
    await this.settings.save(settings);
  }

  async setMaxQueuableSongPerUser(musicSession: MusicSession, value: number) {
    const settings = await musicSession.settings;
    settings.maxQueuableSongPerUser = value;
    await this.settings.save(settings);
  }
}
