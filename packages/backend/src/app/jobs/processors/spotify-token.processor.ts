import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Job } from 'bullmq';
import { Repository } from 'typeorm';
import { SpotifyAccount } from '../../music/spotify/spotify-account.entity';
import { SpotifyApiService } from '../../music/spotify/spotify-api/spotify-api.service';
import { SPOTIFY_TOKEN_QUEUE } from '../queues.constants';

type SpotifyTokenJobName = 'token.renew';

@Processor(SPOTIFY_TOKEN_QUEUE)
@Injectable()
export class SpotifyTokenProcessor extends WorkerHost {
  private readonly logger = new Logger(SpotifyTokenProcessor.name);

  constructor(
    private readonly spotify: SpotifyApiService,
    @InjectRepository(SpotifyAccount)
    private readonly spotifyAccount: Repository<SpotifyAccount>,
  ) {
    super();
  }

  async process(job: Job<any, any, SpotifyTokenJobName>): Promise<void> {
    const { name, data } = job;
    switch (name) {
      case 'token.renew': {
        const account = await this.spotifyAccount.findOne({
          where: { id: data.accountId },
          relations: ['music_session'],
        });
        if (!account) return;
        await (this.spotify as any)['renewToken'](account);
        return;
      }
      default:
        this.logger.warn(`Unknown job ${name}`);
    }
  }
}
