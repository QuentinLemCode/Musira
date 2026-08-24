import type { OnModuleInit } from '@nestjs/common';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { MusicSession } from '../../music-session/entities/music-session.entity';
import { MusicSessionService } from '../../music-session/music-session.service';
import type { Music } from '../music.entity';
import { SpotifyApiService } from '../spotify/spotify-api/spotify-api.service';
import { Backlog } from './backlog.entity';

@Injectable()
export class BacklogService implements OnModuleInit {
  constructor(
    private readonly spotify: SpotifyApiService,
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
    const cached = this.nextInBacklog.get(musicSession.id);
    const backlog =
      cached ?? (await this.nominateFromBacklog(musicSession));
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
    return this.get(musicSession);
  }

  delete(id: string | number) {
    return this.backlog.delete({ id: +id });
  }

  findForEngine(id: number) {
    return this.backlog.findOne({
      where: { id },
      relations: ['music', 'music_session'],
    });
  }

  async getNominatedBacklog(musicSession: MusicSession) {
    const next = this.nextInBacklog.get(musicSession.id);
    if (!next) {
      const nominatedBacklog = await this.nominateFromBacklog(musicSession);
      this.nextInBacklog.set(musicSession.id, nominatedBacklog);
      return nominatedBacklog;
    }
    return this.nextInBacklog.get(musicSession.id);
  }

  async import(spotifyPlaylistId: string, musicSession: MusicSession) {
    const playlist = await this.spotify.getPlaylistFromId(
      spotifyPlaylistId,
      musicSession,
    );
    if (!playlist || playlist.status === 'error' || !playlist.data)
      throw new NotFoundException({
        cause: 'not-found',
        message: 'playlist not found',
      });

    let count = 0;
    let skipped = 0;

    for (const item of playlist.data.tracks.items) {
      if (!item.track) continue;
      if (!item.track.artists[0]) continue;
      if (!item.track.album.images[0]) continue;
      if (!item.track.is_playable) continue;
      const music: Music = {
        album: item.track.album.name,
        artist: item.track.artists[0].name,
        cover: item.track.album.images[0].url,
        duration: item.track.duration_ms,
        uri: item.track.uri,
        title: item.track.name,
        queue: [],
      };
      const alreadyInBacklog = await this.findInBacklog(
        musicSession,
        music.uri,
      );
      if (alreadyInBacklog) {
        skipped += 1;
        continue;
      }
      const backlog = new Backlog();
      backlog.music = music;
      backlog.music_session = musicSession;
      await this.backlog.save(backlog);
      count += 1;
    }
    return { added: count, skipped };
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
