import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { env } from 'process';
import { UsersModule } from '../users/users.module';
import DatabaseLogger from './database.logger';
import { HealthController } from './health/health.controller';
import { SettingsController } from './settings/settings.controller';
import { Settings } from './settings/settings.entity';
import { SettingsService } from './settings/settings.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({
      secret: env.JWT_SECRET ?? 'secret',
      signOptions: { expiresIn: env.JWT_EXPIRATION ?? '10m' },
    }),
    HttpModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: env.DATABASE_HOST || 'localhost',
      port: env.DATABASE_PORT ? Number.parseInt(env.DATABASE_PORT, 10) : 5432,
      autoLoadEntities: true,
      synchronize: true,
      logger: new DatabaseLogger(),
    }),
    // TypeOrmModule.forRoot({
    //   type: 'mysql',
    //   host: env.DATABASE_HOST || 'localhost',
    //   port: env.DATABASE_PORT ? Number.parseInt(env.DATABASE_PORT, 10) : 3306,
    //   username: env.DATABASE_USER || 'admin',
    //   password: env.DATABASE_PASSWORD || 'password',
    //   database: env.DATABASE_NAME || 'party-anniversary',
    //   autoLoadEntities: true,
    //   synchronize: true,
    //   logger: new DatabaseLogger(),
    // }),
    TypeOrmModule.forFeature([Settings]),
    ScheduleModule.forRoot(),
    UsersModule,
  ],
  providers: [SettingsService],
  controllers: [SettingsController, HealthController],
  exports: [
    JwtModule,
    HttpModule,
    ConfigModule,
    TypeOrmModule,
    ScheduleModule,
    UsersModule,
    SettingsService,
  ],
})
export class CoreModule {}
