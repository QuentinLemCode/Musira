import type {
  EmailLoginInterface,
  EmailRegisterInterface,
  OAuthProviderType,
} from '@musira/api-interfaces';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes, randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import type { MusicSession } from '../music-session/entities/music-session.entity';
import { hashPassword } from '../utils/hash';
import { EmailUser } from './user.email.entity';
import { User } from './user.entity';
import { OAuthUser } from './user.oauth.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(OAuthUser)
    private readonly oAuthUsers: Repository<OAuthUser>,
    @InjectRepository(EmailUser)
    private readonly emailUsers: Repository<EmailUser>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  private readonly LOGGER = new Logger(UsersService.name);

  find(name: string) {
    return this.users.findOne({ where: { name } });
  }

  findById(id: number) {
    return this.users.findOneBy({ id });
  }

  findEmailUserById(id: number) {
    return this.emailUsers.findOneBy({ id });
  }

  findByEmail(email: string) {
    return this.users.findOneBy({ email });
  }

  delete(id: number) {
    return this.users.delete(id);
  }

  getAll() {
    return this.users.find({
      select: ['id', 'name', 'role', 'created_at', 'updated_at'],
    });
  }

  findOneOAuthLoginByEmail(email: string) {
    return this.oAuthUsers.findOneBy({
      email,
    });
  }

  findOneOAuthLoginByExternalId(externalId: string) {
    return this.oAuthUsers.findOneBy({
      externalId,
    });
  }

  async isCreatorOfSession(
    email: string,
    publicCode: number,
  ): Promise<boolean> {
    const user = await this.users
      .createQueryBuilder('user')
      .leftJoinAndSelect(
        'user.sessionCreated',
        'sessionCreated',
        'sessionCreated.creatorId = user.id',
      )
      .where('user.email = :email', { email })
      .andWhere('sessionCreated.publicCode = :publicCode', { publicCode })
      .getOne();
    return !!user;
  }

  async unlock(id: number) {
    const user = await this.emailUsers.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.loginTries = 0;
    user.locked = false;
    await this.users.save(user);
  }

  async getQueuedMusicForUser(musicSession: MusicSession, id: number) {
    const queuedMusics = await musicSession.queued_musics;
    return queuedMusics.filter((q) => q.userId === id);
  }

  async OAuthLogin(
    email: string,
    firstName: string,
    lastName: string,
    photoUrl: string,
    externalId: string,
    provider: OAuthProviderType,
  ) {
    const existingUser = await this.findOneOAuthLoginByExternalId(externalId);
    if (existingUser !== null) {
      await this.oAuthUsers.update(
        { id: existingUser.id },
        {
          firstName,
          lastName,
          photoUrl,
          email,
        },
      );
      return await this.oAuthUsers.findOneByOrFail({ id: existingUser.id });
    }
    const user = this.oAuthUsers.create();
    if ((firstName + lastName).trim() === '') {
      user.firstName = email;
    }
    user.email = email;
    user.firstName = firstName;
    user.lastName = lastName;
    user.photoUrl = photoUrl;
    user.provider = provider;
    user.externalId = externalId;
    return this.users.save(user);
  }

  async emailRegister(registerDTO: EmailRegisterInterface) {
    const user = this.emailUsers.create();
    user.salt = randomBytes(16).toString('base64');
    user.email = registerDTO.email;
    user.name = registerDTO.username;
    user.password = hashPassword(registerDTO.password, user.salt);
    try {
      const savedUser = await this.emailUsers.save(user);
      return savedUser;
    } catch (e) {
      return null;
    }
  }

  async emailLogin(login: EmailLoginInterface) {
    const { email, password } = login;
    const user = await this.emailUsers.findOneBy({ email });
    if (!user) {
      return null;
    }
    if (!user.password || hashPassword(password, user.salt) !== user.password) {
      user.loginTries += 1;
      await this.emailUsers.save(user);
      return null;
    }
    user.loginTries = 0;
    await this.emailUsers.save(user);
    return user;
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
