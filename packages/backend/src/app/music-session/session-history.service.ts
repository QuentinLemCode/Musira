import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { MusicSession } from './entities/music-session.entity';
import { SessionHistory } from './entities/session-history.entity';

@Injectable()
export class SessionHistoryService {
  constructor(
    @InjectRepository(SessionHistory)
    private readonly historyRepo: Repository<SessionHistory>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async recordJoin(userId: number, musicSession: MusicSession) {
    const user = await this.usersRepo.findOneBy({ id: userId });
    if (!user) return;

    const existing = await this.historyRepo.findOne({
      where: { user: { id: userId }, music_session: { id: musicSession.id } },
      relations: ['user', 'music_session'],
    });
    if (existing) {
      existing.joined_at = new Date();
      await this.historyRepo.save(existing);
      return existing;
    }
    const created = this.historyRepo.create({
      user,
      music_session: musicSession,
    });
    return this.historyRepo.save(created);
  }

  getHistoryForUser(userId: number) {
    return this.historyRepo.find({
      where: { user: { id: userId } },
      relations: ['music_session', 'music_session.creator'],
      order: { joined_at: 'DESC' },
      take: 25,
    });
  }
}
