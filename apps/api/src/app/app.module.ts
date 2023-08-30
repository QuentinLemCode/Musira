import {
  Module,
  type DynamicModule,
  type Type,
  type ForwardReference,
  Logger,
} from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { MusicModule } from './music/music.module';
import { MusicSessionModule } from './music-session/music-session.module';
import { UsersModule } from './users/users.module';
import { environment } from '../environments/environment';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

const modules: (
  | Type<any>
  | DynamicModule
  | Promise<DynamicModule>
  | ForwardReference<any>
)[] = [MusicModule, CoreModule, MusicSessionModule, UsersModule];

const logger = new Logger('AppModule');

if (environment.production) {
  logger.log('Production mode');
  modules.push(
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'musira'),
    }),
  );
} else {
  logger.log('development mode');
}

@Module({
  imports: modules,
  controllers: [],
  providers: [],
})
export class AppModule {}
