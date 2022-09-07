import {
  GoneException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { setTimeout } from 'timers';
import { SettingsService } from '../../../core/settings/settings.service';
import { User, UserRole } from '../../../users/user.entity';
import { SpotifyApiService } from '../../spotify/spotify-api/spotify-api.service';
import { CurrentPlaybackResponse } from '../../spotify/types/spotify-interfaces';
import { Backlog } from '../backlog.entity';
import { Queue } from '../queue.entity';
import { QueueService } from '../queue.service';

export interface StartingStatus {
  started: boolean;
  message?: string;
}

@Injectable()
export class QueueEngineService {
  private _isRunning = false;
  get isRunning() {
    return this._isRunning;
  }

  private set isRunning(value: boolean) {
    this._isRunning = value;
  }

  constructor(
    private readonly spotify: SpotifyApiService,
    private readonly queues: QueueService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly settings: SettingsService,
  ) {}

  private readonly logger = new Logger('QueueEngine');
  private readonly SONG_START_SCHEDULER_NAME = 'music-start';
  private readonly SONG_END_SCHEDULER_NAME = 'music-end';

  private static readonly START_ENGINE_FAIL =
    'No queue found or spotify account not registered : unable to start the engine';

  private static readonly FAIL_PLAY = 'Unable to play song';
  private static readonly FAIL_NO_DEVICES = 'No device found';

  async start(): Promise<StartingStatus> {
    await this.refreshPlayingQueue();
    const queue = await this.queues.pop();
    if (!queue || !this.spotify.isAccountRegistered()) {
      const message = QueueEngineService.START_ENGINE_FAIL;
      this.logger.warn(message);
      return {
        started: false,
        message,
      };
    }
    this.isRunning = true;
    const response = await this.spotify.play(queue.music.uri);
    if (response.status === 'error') {
      if (response.cause === 'no-device') {
        return { started: false, message: QueueEngineService.FAIL_NO_DEVICES };
      }
      return { started: false, message: QueueEngineService.FAIL_PLAY };
    }
    await this.queues.setPlaying(queue);
    // we wait a bit for the music launch
    setTimeout(() => {
      this.launchEngine(queue);
    }, 5000);
    return {
      started: true,
    };
  }

  stop() {
    this.deleteTimeouts();
    this.isRunning = false;
  }

  async refreshPlayingQueue() {
    const queue = await this.queues.getPlayingQueue();
    if (!queue) return;
    this.queues.setFinished(queue);
  }

  async forward(queueOrId: Queue | string | number, user: User) {
    if (!this.isRunning) {
      throw new GoneException({ cause: 'engine-not-running' });
    }
    if (user.role === UserRole.ADMIN) {
      return this.next(await this.queues.getQueue(queueOrId));
    }
    const queue = await this.queues.vote(queueOrId, user);
    const voteCount = queue.forward_vote_users.length;
    if (voteCount >= this.settings.maxVotes) {
      return this.next(queue);
    }
  }

  async next(queue?: Queue | null) {
    if (!queue) {
      queue = await this.queues.pop();
      if (queue === null) {
        this.logger.warn('No queue found, stopping engine');
        this.stop();
        return;
      }
    }
    if (!queue.music) {
      queue = await this.queues.getQueue(queue.id);
    }
    this.deleteTimeouts();
    const playingQueue = await this.queues.getPlayingQueue();
    if (playingQueue) {
      await this.queues.setFinished(playingQueue);
    }
    await this.spotify.play(queue.music.uri);
    await this.queues.setPlaying(queue);
    this.launchEngine(queue);
  }

  // Engines related functions

  private async launchEngine(queue: Queue) {
    const playState = await this.getPlayState();
    if (!playState) return;

    this.logger.log('Engine started');

    const timeoutEndOfSong = this.calculateWhenBeforeCurrentSongFinish(
      playState.currentPlayback,
    );

    this.deleteTimeouts();
    this.startTimeout(timeoutEndOfSong, this.SONG_END_SCHEDULER_NAME, () =>
      this.endOfSongEvent(queue),
    );
  }

  // end of song
  // we add the next song to the queue
  // we put the song state as finished
  // we then program the start of song event timeout
  private async endOfSongEvent(queue: Queue | Backlog) {
    const playState = await this.getPlayState();
    if (!playState) return;

    if (queue instanceof Queue) await this.queues.setFinished(queue);
    const currentMusic = playState.currentPlayback;
    if (currentMusic.item?.uri !== queue.music.uri) {
      this.logger.log(
        'End of song : Current playing music is not the same as the one in the queue, stopping engine',
      );
      return this.stop();
    }
    const nextQueue = await this.queues.pop();
    let backlog: Backlog;
    if (nextQueue !== null) {
      await this.spotify.addToQueue(nextQueue.music.uri);
      this.logger.log(
        'End of song : added music to spotify queue ' +
          nextQueue.music.toString(),
      );
    } else {
      const poppedBacklog = await this.queues.popBacklog();
      if (!poppedBacklog) return this.stop();
      backlog = poppedBacklog;
      this.logger.log('End of song : Retrieve music from backlog');
      await this.spotify.addToQueue(backlog.music.uri);
    }
    const timeoutBeginNextSong = this.calculateWhenNextSongBegin(
      playState.currentPlayback,
    );
    this.startTimeout(
      timeoutBeginNextSong,
      this.SONG_START_SCHEDULER_NAME,
      () => this.startOfSongEvent(nextQueue ?? backlog),
    );
    this.stopTimeout(this.SONG_END_SCHEDULER_NAME);
  }

  // start of song
  // we check the song has been started
  // we put the song state as playing
  // we then program the end of song event timeout
  private async startOfSongEvent(queue: Queue | Backlog) {
    const playState = await this.getPlayState();
    if (!playState) return;

    const currentMusic = playState.currentPlayback;
    if (currentMusic.item?.uri !== queue.music.uri) {
      this.logger.log(
        'Start of song : Current playing music is not the same as the one in the queue, stopping engine',
        'Expecting ' + queue.music.toString(),
      );
      return this.stop();
    }
    if (queue instanceof Queue) await this.queues.setPlaying(queue);
    const timeoutEndOfSong = this.calculateWhenBeforeCurrentSongFinish(
      playState.currentPlayback,
    );
    this.startTimeout(timeoutEndOfSong, this.SONG_END_SCHEDULER_NAME, () =>
      this.endOfSongEvent(queue),
    );
    this.logger.log(`Start of song : ${queue.music.toString()}`);
    this.stopTimeout(this.SONG_START_SCHEDULER_NAME);
  }

  private async getPlayState() {
    const response = await this.spotify.getPlaybackState(true);
    if (response.status === 'error' || !response.data) {
      throw new ServiceUnavailableException();
    }
    const playState = response.data;
    if (!playState.registered || !playState.currentPlayback.is_playing) {
      const error = playState.registered
        ? 'Music not playing'
        : 'Spotify not registered';
      this.logger.warn(error + ', stopping engine');
      this.stop();
      return null;
    }
    return playState;
  }

  // Time related functions

  private startTimeout(
    timeout: number,
    name: string,
    func: (queue: Queue) => void,
  ) {
    if (this.schedulerRegistry.doesExist('timeout', name)) return;
    const timeoutFunction = setTimeout(func, timeout);
    this.schedulerRegistry.addTimeout(name, timeoutFunction);
  }

  private deleteTimeouts() {
    this.stopTimeout(this.SONG_END_SCHEDULER_NAME);
    this.stopTimeout(this.SONG_START_SCHEDULER_NAME);
  }

  private stopTimeout(name: string) {
    if (this.schedulerRegistry.doesExist('timeout', name)) {
      this.schedulerRegistry.deleteTimeout(name);
    }
  }

  private calculateWhenNextSongBegin(currentMusic: CurrentPlaybackResponse) {
    return (
      (currentMusic.item?.duration_ms ?? 0) -
      (currentMusic.progress_ms ?? 0) +
      5000
    );
  }

  private calculateWhenBeforeCurrentSongFinish(
    currentMusic: CurrentPlaybackResponse,
  ) {
    return (
      (currentMusic.item?.duration_ms ?? 0) -
      (currentMusic.progress_ms ?? 0) -
      20000
    );
  }
}
