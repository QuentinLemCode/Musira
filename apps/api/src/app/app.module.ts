import {
  Module,
  type DynamicModule,
  type Type,
  type ForwardReference,
  Logger,
} from '@nestjs/common';
import { CoreModule } from './core/core.module.js';
import { MusicModule } from './music/music.module.js';
import { MusicSessionModule } from './music-session/music-session.module.js';
import { UsersModule } from './users/users.module.js';
import { environment } from '../environments/environment.js';
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
      exclude: ['/api/(.*)'],
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
