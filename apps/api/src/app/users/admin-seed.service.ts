import type { OnApplicationBootstrap } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { hashPassword } from '../utils/hash.js';
import { EmailUser } from './user.email.entity.js';
import { UserRole } from './user.entity.js';

@Injectable()
export class AdminSeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(EmailUser) private users: Repository<EmailUser>,
  ) {}
  async onApplicationBootstrap() {
    let admin = await this.users.findOneBy({ role: UserRole.ADMIN });
    if (!admin) {
      const password = process.env.DEFAULT_ADMIN_PASSWORD || 'admin';
      const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@musira.fr';
      admin = this.users.create();
      admin.salt = randomBytes(16).toString('base64');
      admin.password = hashPassword(password, admin.salt);
      admin.name = 'admin';
      admin.role = UserRole.ADMIN;
      admin.email = email;
      this.users.save(admin);
    } else if (!admin.email) {
      admin.email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@musira.fr';
      this.users.save(admin);
    }
  }
}
