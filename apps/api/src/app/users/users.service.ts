import type { EmailRegisterDTO } from '@musira/api-interfaces/user/email.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes, randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import type { MusicSession } from '../music-session/entities/music-session.entity';
import { hashPassword } from '../utils/hash';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  find(name: string) {
    return this.users.findOne({ where: { name } });
  }

  findById(id: number) {
    return this.users.findOneBy({ id });
  }

  delete(id: number) {
    return this.users.delete(id);
  }

  getAll() {
    return this.users.find({
      select: [
        'id',
        'name',
        'role',
        'locked',
        'noIPverification',
        'created_at',
        'updated_at',
        'ip',
        'loginTries',
      ],
    });
  }

  async getQueuedMusicForUser(musicSession: MusicSession, id: number) {
    const queuedMusics = await musicSession.queued_musics;
    return queuedMusics.filter((q) => q.userId === id);
  }

  async emailRegister(registerDTO: EmailRegisterDTO) {
    const user = this.users.create();
    user.salt = randomBytes(16).toString('base64');
    user.name = registerDTO.username;
    user.password = hashPassword(registerDTO.password, user.salt);
    return this.users.save(user);
  }

  addLoginTry(user: User) {
    user.loginTries += 1;
    if (user.loginTries >= 3) {
      user.locked = true;
    }
    return this.users.save(user);
  }

  resetLoginTry(user: User) {
    user.loginTries = 0;
    return this.users.save(user);
  }

  async generateRefreshUUID(id: number) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    const uuid = randomUUID();
    user.refresh_token_id = uuid;
    await this.users.save(user);
    return uuid;
  }

  async removeRefreshUUID(id: number) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    user.refresh_token_id = null;
    return this.users.save(user);
  }
}
