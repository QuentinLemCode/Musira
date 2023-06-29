import { Module } from '@nestjs/common';
import { MusicSessionController } from './music-session.controller';
import { MusicSessionService } from './music-session.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MusicSession } from './entities/music-session.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MusicSession, User])],
  controllers: [MusicSessionController],
  providers: [MusicSessionService],
  exports: [MusicSessionService],
})
export class MusicSessionModule {}
