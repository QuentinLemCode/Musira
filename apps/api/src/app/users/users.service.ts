import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes, randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { hashPassword } from '../utils/hash';
import { User } from './user.entity';
import { RegisterUserDTO } from './users.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  find(name: string) {
    name = this.formatUsername(name);
    return this.users.findOne({ where: { name } });
  }

  findById(id: number) {
    return this.users.findOneBy({ id });
  }

  async delete(id: number) {
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

  async getQueuedMusicForUser(id: number) {
    const user = await this.users.findOne({
      where: { id },
      relations: ['queued_musics'],
    });
    return user?.queued_musics ?? null;
  }

  async unlock(id: number) {
    const user = await this.users.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.loginTries = 0;
    user.locked = false;
    await this.users.save(user);
  }

  async register(registerDTO: RegisterUserDTO, ip: string) {
    if (!registerDTO.challenge) {
      throw new BadRequestException({ cause: 'challenge' });
    }
    await this.hasAlreadyIp(ip);
    const user = this.users.create();
    user.salt = randomBytes(16).toString('base64');
    user.name = this.formatUsername(registerDTO.name);
    user.ip = ip;
    user.challenge = hashPassword(registerDTO.challenge, user.salt);
    return this.users.save(user);
  }

  removeIPverification(user: User) {
    user.noIPverification = true;
    user.ip = null;
    return this.users.save(user);
  }

  async saveIp(user: User, ip: string) {
    if (user.noIPverification) return;
    await this.hasAlreadyIp(ip);
    user.ip = ip;
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

  async toggleIPVerification(id: number) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    user.noIPverification = !user.noIPverification;
    user.ip = null;
    return this.users.save(user);
  }

  private async hasAlreadyIp(ip: string) {
    const userWithIp = await this.users.findOneBy({ ip });
    if (userWithIp !== null) {
      throw new BadRequestException({ cause: 'ip' });
    }
  }

  private formatUsername(username: string) {
    return username
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\-]/gi, '');
  }
}
