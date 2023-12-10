import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { env } from 'process';
import { UsersModule } from '../users/users.module.js';
import { HealthController } from './health/health.controller.js';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot(),
    HttpModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: env.DATABASE_HOST || 'localhost',
      port: env.DATABASE_PORT ? Number.parseInt(env.DATABASE_PORT, 10) : 3306,
      username: env.DATABASE_USER || 'admin',
      password: env.DATABASE_PASSWORD || 'password',
      database: env.DATABASE_NAME || 'musira',
      autoLoadEntities: true,
      synchronize: true,
      logging: ['error', 'warn'],
      maxQueryExecutionTime: 1000,
    }),
    ScheduleModule.forRoot(),
    UsersModule,
  ],
  controllers: [HealthController],
  exports: [
    HttpModule,
    ConfigModule,
    TypeOrmModule,
    ScheduleModule,
    UsersModule,
  ],
})
export class CoreModule {}
