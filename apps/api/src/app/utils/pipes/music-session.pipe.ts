import type { ArgumentMetadata, PipeTransform } from '@nestjs/common';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MusicSessionService } from '../../music-session/music-session.service';

@Injectable()
export class MusicSessionPipe implements PipeTransform {
  constructor(
    @Inject(MusicSessionService)
    private readonly session: MusicSessionService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async transform(value: number, _metadata: ArgumentMetadata) {
    const musicSession = await this.session.findOneByPublicCode(value);
    if (!musicSession) throw new NotFoundException('session not found');
    return musicSession;
  }
}
