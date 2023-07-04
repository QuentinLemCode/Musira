import { Injectable, PipeTransform } from '@nestjs/common';
import { MusicSessionService } from '../../music-session/music-session.service';

@Injectable()
export class HashIdSessionPipe implements PipeTransform {
  // inject any dependency
  constructor(private readonly musicSession: MusicSessionService) {}

  async transform(value: any) {
    if (typeof value !== 'string') return value;
    return this.musicSession.findOneByHashid(value);
  }
}
