import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import type { MusicSession } from '../../music-session/entities/music-session.entity.js';
import type { User } from '../../users/user.entity.js';
import { UserRole } from '../../users/user.entity.js';
import type { Music } from '../music.entity.js';
import { Queue, Status } from './queue.entity.js';

@Injectable()
export class QueueService {
  constructor(
    @InjectRepository(Queue) private readonly queue: Repository<Queue>,
  ) {}

  private readonly logger = new Logger('Queue');

  // queue basic functions

  async push(
    musicSession: MusicSession,
    music: Music,
    userId: number,
    isAdmin = false,
  ) {
    const alreadyInQueue = await this.findInPendingQueue(
      musicSession,
      music.uri,
    );
    if (alreadyInQueue) {
      throw new BadRequestException({ cause: 'queue' });
    }
    const queue = new Queue();
    queue.music = music;
    queue.userId = userId;
    queue.music_session = musicSession;
    queue.priority = isAdmin
      ? 0
      : (await this.countQueuedItemForUser(userId)) + 1;
    return this.queue.save(queue);
  }

  async pop(musicSession: MusicSession) {
    const queue = await this.getPendingQueue(musicSession, 1);
    if (queue.length === 0) {
      return null;
    }
    const [first] = queue;
    if (!first) return null;
    first.status = Status.PLAYING;
    await this.queue.save(first);
    await this.updatePriority(first.userId);
    return first;
  }

  get(musicSession: MusicSession) {
    return this.getQueueForStatus(musicSession, Status.PENDING, Status.PLAYING);
  }

  // features

  async delete(queueOrId: Queue | string | number) {
    if (typeof queueOrId === 'string' || typeof queueOrId === 'number') {
      const queue = await this.queue.findOneBy({ id: +queueOrId });
      if (!queue) {
        throw new NotFoundException('Queue not found');
      }
      queueOrId = queue;
    }
    if (queueOrId.status !== Status.PENDING) {
      throw new BadRequestException({ cause: 'status' });
    }
    queueOrId.status = Status.CANCELLED;
    await this.queue.save(queueOrId);
    await this.queue.softRemove(queueOrId);
    await this.updatePriority(queueOrId.userId);
  }

  async vote(queueOrId: Queue | string | number, user: User) {
    const queue = await this.getQueue(queueOrId);
    if (queue.forward_vote_users?.find((u) => u.id === user.id)) {
      throw new BadRequestException({ cause: 'already-voted' });
    }
    queue.forward_vote_users = [...(queue.forward_vote_users ?? []), user];
    await this.queue.save(queue);
    return queue;
  }

  async updatePriority(userId: number) {
    const otherQueues = await this.queue.find({
      where: {
        userId: userId,
        status: Raw("'0'"),
      },
      order: {
        priority: 'ASC',
        created_at: 'ASC',
      },
      relations: ['user'],
    });
    otherQueues.forEach(async (queue, index) => {
      const user = queue.user;
      if (user.role === UserRole.ADMIN) {
        queue.priority = 0;
      }
      queue.priority = index + 1;
    });
    return this.queue.save(otherQueues);
  }

  async getQueue(queueOrId: Queue | number | string) {
    let queue: Queue | undefined;
    if (typeof queueOrId === 'string' || typeof queueOrId === 'number') {
      [queue] = await this.queue.find({
        where: { id: +queueOrId },
        relations: ['forward_vote_users', 'music'],
      });
    } else {
      queue = queueOrId;
    }
    if (!queue) {
      throw new BadRequestException('Queue not found');
    }
    return queue;
  }

  public async getPlayingQueue(): Promise<Queue | null> {
    const [queue, ...anothers] = await this.queue.find({
      where: { status: Raw("'1'") },
      relations: ['music'],
    });
    if (anothers.length > 0) {
      this.queue.remove(anothers);
    }
    return queue || null;
  }

  countQueuedItemForUser(userId: number) {
    return this.queue.count({
      where: { userId, status: Raw("'0'") },
    });
  }

  // state management

  public async setPlaying(queue: Queue) {
    queue.status = Status.PLAYING;
    await this.queue.save(queue);
  }

  public async setFinished(queue: Queue) {
    queue.status = Status.FINISHED;
    await this.queue.save(queue);
  }

  // internal functions

  private findInPendingQueue(music_session: MusicSession, uri: string) {
    return this.queue
      .createQueryBuilder('queue')
      .leftJoinAndSelect('queue.music', 'music')
      .leftJoinAndSelect('queue.music_session', 'session')
      .where('music.uri = :uri', { uri })
      .andWhere('session.id = :id', { id: music_session.id })
      .andWhere('queue.status IN (:status)', { status: ['0', '1'] })
      .getOne();
  }

  private getPendingQueue(music_session: MusicSession, take = 50) {
    return this.queue.find({
      order: {
        priority: 'ASC',
        created_at: 'ASC',
      },
      take,
      where: { status: Raw("'0'"), music_session: { id: music_session.id } },
      relations: ['music'],
    });
  }

  private async getQueueForStatus(
    music_session: MusicSession,
    ...status: Status[]
  ) {
    const whereStatus = status.map((s) => '' + s);
    return this.queue
      .createQueryBuilder('queue')
      .leftJoinAndSelect('queue.music', 'music')
      .leftJoinAndSelect('queue.user', 'user')
      .leftJoinAndSelect('queue.music_session', 'session')
      .loadRelationCountAndMap(
        'queue.forward_votes',
        'queue.forward_vote_users',
      )
      .select(['queue.status', 'music', 'user.name', 'user.id', 'queue.id'])
      .where('queue.status IN (:status)', { status: whereStatus })
      .andWhere('session.id = :id', { id: music_session.id })
      .orderBy('queue.status', 'DESC')
      .addOrderBy('queue.priority', 'ASC')
      .addOrderBy('queue.created_at', 'ASC')
      .getMany();
  }
}
