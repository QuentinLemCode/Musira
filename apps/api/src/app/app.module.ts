import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { MusicModule } from './music/music.module';
import { MusicSessionModule } from './music-session/music-session.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [MusicModule, CoreModule, MusicSessionModule, UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
