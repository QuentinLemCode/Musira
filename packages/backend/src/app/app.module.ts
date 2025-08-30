import { BullModule } from '@nestjs/bullmq';
import { Logger, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CoreModule } from './core/core.module';
import { JobsModule } from './jobs/jobs.module';
import { MusicSessionModule } from './music-session/music-session.module';
import { MusicModule } from './music/music.module';
import { UsersModule } from './users/users.module';

const logger = new Logger('AppModule');

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  logger.log('Production mode');
} else {
  logger.log('development mode');
}

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: Number(process.env.REDIS_PORT || 6379),
        password: process.env.REDIS_PASSWORD || '',
      },
    }),
    JobsModule,
    CoreModule,
    MusicModule,
    MusicSessionModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [],
})
export class AppModule {}
