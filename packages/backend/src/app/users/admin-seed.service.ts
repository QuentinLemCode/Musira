import type { OnApplicationBootstrap } from '@nestjs/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { generateSalt, hashPassword } from '../utils/hash';
import { EmailUser } from './user.email.entity';
import { UserRole } from './user.entity';

@Injectable()
export class AdminSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(
    @InjectRepository(EmailUser) private users: Repository<EmailUser>,
  ) {}
  async onApplicationBootstrap() {
    let admin = await this.users.findOneBy({ role: UserRole.ADMIN });
    if (!admin) {
      const password = process.env.DEFAULT_ADMIN_PASSWORD;
      const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@musira.fr';
      if (!password) {
        this.logger.error(
          'No admin user exists and DEFAULT_ADMIN_PASSWORD is not set. Skipping admin seed; set the variable and restart to create the initial admin account.',
        );
        return;
      }
      admin = this.users.create();
      admin.salt = generateSalt();
      admin.password = await hashPassword(password);
      admin.name = 'admin';
      admin.role = UserRole.ADMIN;
      admin.email = email;
      await this.users.save(admin);
    } else if (!admin.email) {
      admin.email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@musira.fr';
      await this.users.save(admin);
    }
  }
}
