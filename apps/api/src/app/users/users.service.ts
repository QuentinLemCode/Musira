import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes, randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import type { MusicSession } from '../music-session/entities/music-session.entity';
import { hashPassword } from '../utils/hash';
import { EmailUser } from './user.email.entity';
import { SocialLoginUser } from './user.social-login.entity';
import { User } from './user.entity';
import type {
  SocialUserDTO,
  EmailRegisterDTO,
} from '@musira/api-interfaces/index';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(SocialLoginUser)
    private readonly socialUsers: Repository<SocialLoginUser>,
    @InjectRepository(EmailUser)
    private readonly emailUsers: Repository<EmailUser>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  find(name: string) {
    return this.users.findOne({ where: { name } });
  }

  findById(id: number) {
    return this.users.findOneBy({ id });
  }

  findEmailUserById(id: number) {
    return this.emailUsers.findOneBy({ id });
  }

  delete(id: number) {
    return this.users.delete(id);
  }

  getAll() {
    return this.users.find({
      select: ['id', 'name', 'role', 'created_at', 'updated_at'],
    });
  }

  async getQueuedMusicForUser(musicSession: MusicSession, id: number) {
    const queuedMusics = await musicSession.queued_musics;
    return queuedMusics.filter((q) => q.userId === id);
  }

  async emailRegister(registerDTO: EmailRegisterDTO) {
    const user = this.emailUsers.create();
    user.salt = randomBytes(16).toString('base64');
    user.name = registerDTO.username;
    user.password = hashPassword(registerDTO.password, user.salt);
    return this.users.save(user);
  }

  async socialLogin(socialUserDTO: SocialUserDTO) {
    const user = this.socialUsers.create();
    user.authToken = socialUserDTO.authToken;
    user.email = socialUserDTO.email;
    user.idToken = socialUserDTO.idToken;
    user.name = socialUserDTO.name;
    user.photoUrl = socialUserDTO.photoUrl;
    user.provider = socialUserDTO.provider;
    user.idToken = socialUserDTO.idToken;
    return this.users.save(user);
  }

  addLoginTry(user: EmailUser) {
    user.loginTries += 1;
    if (user.loginTries >= 3) {
      user.locked = true;
    }
    return this.users.save(user);
  }

  resetLoginTry(user: EmailUser) {
    user.loginTries = 0;
    return this.users.save(user);
  }

  async generateRefreshUUID(id: number) {
    const user = await this.findEmailUserById(id);
    if (!user) throw new NotFoundException('User not found');
    const uuid = randomUUID();
    user.refresh_token_id = uuid;
    await this.users.save(user);
    return uuid;
  }

  async removeRefreshUUID(id: number) {
    const user = await this.findEmailUserById(id);
    if (!user) throw new NotFoundException('User not found');
    user.refresh_token_id = null;
    return this.users.save(user);
  }
}
