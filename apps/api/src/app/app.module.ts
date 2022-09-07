import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { CoreModule } from './core/core.module';
import { MusicModule } from './music/music.module';

@Module({
  imports: [AuthModule, MusicModule, CoreModule],
  controllers: [],
  providers: [AuthService],
})
export class AppModule {}
