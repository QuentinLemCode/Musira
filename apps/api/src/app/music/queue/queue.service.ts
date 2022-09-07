import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import { User, UserRole } from '../../users/user.entity';
import { Music } from '../music.entity';
import { Backlog } from './backlog.entity';
import { Queue, Status } from './queue.entity';

@Injectable()
export class QueueService implements OnModuleInit {
  constructor(
    @InjectRepository(Queue) private readonly queue: Repository<Queue>,
    @InjectRepository(Backlog) private readonly backlog: Repository<Backlog>,
  ) {}

  async onModuleInit() {
    this.nextInBacklog = await this.nominateFromBacklog();
  }

  private readonly logger = new Logger('Queue');

  private nextInBacklog: Backlog | null;

  // queue basic functions

  async push(music: Music, userId: number, isAdmin = false) {
    const alreadyInQueue = await this.findInPendingQueue(music.uri);
    if (alreadyInQueue) {
      throw new BadRequestException({ cause: 'queue' });
    }
    const queue = new Queue();
    queue.music = music;
    queue.userId = userId;
    queue.priority = isAdmin
      ? 0
      : (await this.countQueuedItemForUser(userId)) + 1;
    return this.queue.save(queue);
  }

  async pushBacklog(music: Music) {
    const alreadyInBacklog = await this.findInBacklog(music.uri);
    if (alreadyInBacklog) {
      throw new BadRequestException({ cause: 'backlog' });
    }
    const backlog = new Backlog();
    backlog.music = music;
    await this.backlog.save(backlog);
  }

  async pop() {
    const queue = await this.getPendingQueue(1);
    if (queue.length === 0) {
      return null;
    }
    const [first] = queue;
    first.status = Status.PLAYING;
    await this.queue.save(first);
    await this.updatePriority(first.userId);
    return first;
  }

  async popBacklog() {
    const backlog = this.nextInBacklog || (await this.nominateFromBacklog());
    if (!backlog) {
      return null;
    }
    backlog.play_count += 1;
    await this.backlog.save(backlog);
    this.nextInBacklog = null;
    return backlog;
  }

  get() {
    return this.getQueueForStatus(Status.PENDING, Status.PLAYING);
  }

  async getBacklog() {
    return this.backlog.find({
      relations: ['music'],
    });
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

  deleteBacklog(id: string | number) {
    return this.backlog.delete({ id: +id });
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

  async getQueue(queueOrId: Queue | number | string) {
    let queue: Queue;
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

  async getNominatedBacklog() {
    if (!this.nextInBacklog) {
      this.nextInBacklog = await this.nominateFromBacklog();
    }
    return this.nextInBacklog;
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

  private findInPendingQueue(uri: string) {
    return this.queue
      .createQueryBuilder('queue')
      .leftJoinAndSelect('queue.music', 'music')
      .where('music.uri = :uri', { uri })
      .andWhere('queue.status IN (:status)', { status: ['0', '1'] })
      .getOne();
  }

  private findInBacklog(uri: string) {
    return this.backlog
      .createQueryBuilder('backlog')
      .leftJoinAndSelect('backlog.music', 'music')
      .where('music.uri = :uri', { uri })
      .getOne();
  }

  private async nominateFromBacklog() {
    const minimumPlayCount: { min: number | null } = (await this.backlog
      .createQueryBuilder('backlog')
      .select('MIN(backlog.play_count)', 'min')
      .getRawOne()) ?? { min: null };
    if (minimumPlayCount.min === null) {
      return null;
    }
    return this.backlog
      .createQueryBuilder('backlog')
      .select('backlog')
      .leftJoinAndSelect('backlog.music', 'music')
      .andWhere('backlog.play_count = :playCount', {
        playCount: minimumPlayCount.min,
      })
      .orderBy('RAND()')
      .getOne();
  }

  private getPendingQueue(take = 50) {
    return this.queue.find({
      order: {
        priority: 'ASC',
        created_at: 'ASC',
      },
      take,
      where: { status: Raw("'0'") },
      relations: ['music'],
    });
  }

  private async getQueueForStatus(...status: Status[]) {
    const whereStatus = status.map((s) => '' + s);
    return this.queue
      .createQueryBuilder('queue')
      .leftJoinAndSelect('queue.music', 'music')
      .leftJoinAndSelect('queue.user', 'user')
      .loadRelationCountAndMap(
        'queue.forward_votes',
        'queue.forward_vote_users',
      )
      .select(['queue.status', 'music', 'user.name', 'user.id', 'queue.id'])
      .where('queue.status IN (:status)', { status: whereStatus })
      .orderBy('queue.status', 'DESC')
      .addOrderBy('queue.priority', 'ASC')
      .addOrderBy('queue.created_at', 'ASC')
      .getMany();
  }

  private async updatePriority(userId: number) {
    const otherQueues = await this.queue.find({
      where: {
        userId: userId,
      },
      order: {
        priority: 'ASC',
        created_at: 'ASC',
      },
      relations: ['user'],
    });
    otherQueues.forEach((queue, index) => {
      if (queue.user.role === UserRole.ADMIN) {
        queue.priority = 0;
      }
      queue.priority = index + 1;
    });
    return this.queue.save(otherQueues);
  }
}
