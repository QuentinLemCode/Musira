import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import { QueueEngineService } from '../../music/queue/queue-engine/queue-engine.service';
import { MUSIC_ENGINE_QUEUE } from '../queues.constants';

type MusicEngineJobName =
  | 'engine.launch'
  | 'engine.endOfSong'
  | 'engine.startOfSong'
  | 'engine.forwardCheck';

@Processor(MUSIC_ENGINE_QUEUE)
@Injectable()
export class MusicEngineProcessor extends WorkerHost {
  private readonly logger = new Logger(MusicEngineProcessor.name);

  constructor(private readonly engine: QueueEngineService) {
    super();
  }

  async process(job: Job<any, any, MusicEngineJobName>): Promise<void> {
    const { name, data } = job;
    const { musicSessionId, queueId, forwarded } = data ?? {};
    switch (name) {
      case 'engine.launch': {
        await this.engine['launchEngineByIds'](
          musicSessionId,
          queueId,
          !!forwarded,
        );
        return;
      }
      case 'engine.endOfSong': {
        await this.engine['endOfSongByIds'](musicSessionId, queueId);
        return;
      }
      case 'engine.startOfSong': {
        await this.engine['startOfSongByIds'](musicSessionId, queueId);
        return;
      }
      case 'engine.forwardCheck': {
        await this.engine['forwardCheckByIds'](musicSessionId, queueId);
        return;
      }
      default:
        this.logger.warn(`Unknown job ${name}`);
    }
  }
}
