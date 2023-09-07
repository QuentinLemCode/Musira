import type { OnModuleInit } from '@nestjs/common';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { MusicSession } from '../../music-session/entities/music-session.entity';
import { MusicSessionService } from '../../music-session/music-session.service';
import type { Music } from '../music.entity';
import { Backlog } from './backlog.entity';

@Injectable()
export class BacklogService implements OnModuleInit {
  constructor(
    @InjectRepository(Backlog) private readonly backlog: Repository<Backlog>,
    private readonly musicSessions: MusicSessionService,
  ) {}

  // private readonly logger = new Logger('Backlog');
  private nextInBacklog = new Map<number, Backlog | null>();

  async onModuleInit() {
    const activeSessions = await this.musicSessions.getActiveSessions();
    for (const session of activeSessions) {
      this.nextInBacklog.set(
        session.id,
        await this.nominateFromBacklog(session),
      );
    }
  }

  async get(musicSession: MusicSession) {
    return this.backlog.find({
      relations: ['music'],
      where: {
        music_session: {
          id: musicSession.id,
        },
      },
    });
  }

  async pop(musicSession: MusicSession) {
    const backlog =
      this.nextInBacklog.get(musicSession.id) ||
      (await this.nominateFromBacklog(musicSession));
    if (!backlog) {
      return null;
    }
    backlog.play_count += 1;
    await this.backlog.save(backlog);
    this.nextInBacklog.set(musicSession.id, null);
    return backlog;
  }

  async push(musicSession: MusicSession, music: Music) {
    const alreadyInBacklog = await this.findInBacklog(musicSession, music.uri);
    if (alreadyInBacklog) {
      throw new BadRequestException({ cause: 'backlog' });
    }
    const backlog = new Backlog();
    backlog.music = music;
    backlog.music_session = musicSession;
    await this.backlog.save(backlog);
    return this.backlog.find();
  }

  delete(id: string | number) {
    return this.backlog.delete({ id: +id });
  }

  async getNominatedBacklog(musicSession: MusicSession) {
    if (!this.nextInBacklog.has(musicSession.id)) {
      const nominatedBacklog = await this.nominateFromBacklog(musicSession);
      this.nextInBacklog.set(musicSession.id, nominatedBacklog);
      return nominatedBacklog;
    }
    return this.nextInBacklog.get(musicSession.id);
  }

  private findInBacklog(musicSession: MusicSession, uri: string) {
    return this.backlog
      .createQueryBuilder('backlog')
      .leftJoinAndSelect('backlog.music', 'music')
      .where('music.uri = :uri', { uri })
      .andWhere('backlog.musicSessionId = :musicSessionId', {
        musicSessionId: musicSession.id,
      })
      .getOne();
  }

  private async nominateFromBacklog(musicSession: MusicSession) {
    const minimumPlayCount: { min: number | null } = (await this.backlog
      .createQueryBuilder('backlog')
      .select('MIN(backlog.play_count)', 'min')
      .where('backlog.musicSessionId = :musicSessionId', {
        musicSessionId: musicSession.id,
      })
      .getRawOne()) ?? { min: null };
    if (minimumPlayCount.min === null) {
      return null;
    }
    return this.backlog
      .createQueryBuilder('backlog')
      .select('backlog')
      .leftJoinAndSelect('backlog.music', 'music')
      .andWhere('backlog.musicSessionId = :musicSessionId', {
        musicSessionId: musicSession.id,
      })
      .andWhere('backlog.play_count = :playCount', {
        playCount: minimumPlayCount.min,
      })
      .orderBy('RAND()')
      .getOne();
  }
}
