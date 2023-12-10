import {
  GoneException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { setTimeout } from 'timers';
import type { MusicSession } from '../../../music-session/entities/music-session.entity.js';
import type { User } from '../../../users/user.entity.js';
import { UserRole } from '../../../users/user.entity.js';
import type { Backlog } from '../../backlog/backlog.entity.js';
import { BacklogService } from '../../backlog/backlog.service.js';
import { SpotifyApiService } from '../../spotify/spotify-api/spotify-api.service.js';
import type { CurrentPlaybackResponse } from '../../spotify/types/spotify-interfaces.js';
import { Queue } from '../queue.entity.js';
import { QueueService } from '../queue.service.js';

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
    private readonly backlog: BacklogService,
  ) {}

  private readonly logger = new Logger('QueueEngine');
  private readonly SONG_START_SCHEDULER_NAME = 'music-start';
  private readonly SONG_END_SCHEDULER_NAME = 'music-end';
  private readonly FORWARD_MUSIC_RESTART_ENGINE = 'forward-restart';

  private static readonly START_ENGINE_FAIL =
    'No queue found or spotify account not registered : unable to start the engine';

  private static readonly FAIL_PLAY = 'Unable to play song';
  private static readonly FAIL_NO_DEVICES = 'No device found';

  async start(musicSession: MusicSession): Promise<StartingStatus> {
    await this.refreshPlayingQueue();
    const queue = await this.queues.pop(musicSession);
    if (!queue || !this.spotify.isAccountRegistered(musicSession)) {
      const message = QueueEngineService.START_ENGINE_FAIL;
      this.logger.warn(message);
      return {
        started: false,
        message,
      };
    }
    this.isRunning = true;
    const response = await this.spotify.play(musicSession, queue.music.uri);
    if (response.status === 'error') {
      if (response.cause === 'no-device') {
        return { started: false, message: QueueEngineService.FAIL_NO_DEVICES };
      }
      return { started: false, message: QueueEngineService.FAIL_PLAY };
    }
    await this.queues.setPlaying(queue);
    // we wait a bit for the music launch
    setTimeout(() => {
      this.launchEngine(musicSession, queue);
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

  async forward(
    musicSession: MusicSession,
    queueOrId: Queue | string | number,
    user: User,
  ) {
    if (!this.isRunning) {
      throw new GoneException({ cause: 'engine-not-running' });
    }
    if (user.role === UserRole.ADMIN) {
      return this.next(musicSession, await this.queues.getQueue(queueOrId));
    }
    const queue = await this.queues.vote(queueOrId, user);
    const voteCount = queue.forward_vote_users.length;
    if (voteCount >= (await musicSession.settings).maxVotes) {
      await this.next(musicSession, queue);
      await this.queues.updatePriority(queue.userId);
    }
  }

  async next(musicSession: MusicSession, queue?: Queue | null) {
    if (!queue) {
      queue = await this.queues.pop(musicSession);
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
    await this.spotify.play(musicSession, queue.music.uri);
    await this.queues.setPlaying(queue);
    const nextQueue: Queue = queue;
    this.startTimeout(10000, this.FORWARD_MUSIC_RESTART_ENGINE, () =>
      this.launchEngine(musicSession, nextQueue, true),
    );
  }

  // Engines related functions

  private async launchEngine(
    musicSession: MusicSession,
    queue: Queue,
    forwarded = false,
  ) {
    const playState = await this.getPlayState(musicSession);
    if (!playState || !playState.currentPlayback) return;

    if (!playState.currentPlayback.item) {
      this.logger.log(
        `No music playing on Spotify, stopping engine for session ${musicSession.publicCode} ${musicSession.name}`,
      );
    }

    if (!forwarded) {
      this.logger.log(
        `Engine started for session ${musicSession.publicCode} ${musicSession.name}`,
      );
    }

    const timeoutEndOfSong = this.calculateWhenBeforeCurrentSongFinish(
      playState.currentPlayback,
    );

    this.deleteTimeouts();
    this.startTimeout(timeoutEndOfSong, this.SONG_END_SCHEDULER_NAME, () =>
      this.endOfSongEvent(musicSession, queue),
    );
  }

  // end of song
  // we add the next song to the queue
  // we put the song state as finished
  // we then program the start of song event timeout
  private async endOfSongEvent(
    musicSession: MusicSession,
    queue: Queue | Backlog,
  ) {
    const playState = await this.getPlayState(musicSession);
    if (!playState || !playState.currentPlayback) return;

    if (queue instanceof Queue) await this.queues.setFinished(queue);
    const currentMusic = playState.currentPlayback;
    if (currentMusic.item?.uri !== queue.music.uri) {
      this.logger.log(
        `End of song : Current playing music (${currentMusic.item?.name}) is not the same as the one in the queue (${queue.music.title}), stopping engine for session ${musicSession.publicCode} ${musicSession.name}`,
      );
      return this.stop();
    }
    const nextQueue = await this.queues.pop(musicSession);
    let backlog: Backlog;
    if (nextQueue !== null) {
      await this.spotify.addToQueue(musicSession, nextQueue.music.uri);
      this.logger.log(
        `End of song : added music to spotify queue ${nextQueue.music.toString()} for session ${
          musicSession.publicCode
        } ${musicSession.name}`,
      );
    } else {
      const poppedBacklog = await this.backlog.pop(musicSession);
      if (!poppedBacklog) return this.stop();
      backlog = poppedBacklog;
      this.logger.log(
        `End of song : Retrieve music from backlog for session ${musicSession.publicCode} ${musicSession.name}`,
      );
      await this.spotify.addToQueue(musicSession, backlog.music.uri);
    }
    const timeoutBeginNextSong = this.calculateWhenNextSongBegin(
      playState.currentPlayback,
    );
    this.startTimeout(
      timeoutBeginNextSong,
      this.SONG_START_SCHEDULER_NAME,
      () => this.startOfSongEvent(musicSession, nextQueue ?? backlog),
    );
    this.stopTimeout(this.SONG_END_SCHEDULER_NAME);
  }

  // start of song
  // we check the song has been started
  // we put the song state as playing
  // we then program the end of song event timeout
  private async startOfSongEvent(
    musicSession: MusicSession,
    queue: Queue | Backlog,
  ) {
    const playState = await this.getPlayState(musicSession);
    if (!playState || !playState.currentPlayback) return;

    const currentMusic = playState.currentPlayback;
    if (currentMusic.item?.uri !== queue.music.uri) {
      this.logger.log(
        `Start of song : Current playing music is not the same as the one in the queue, stopping engine for session ${musicSession.publicCode} ${musicSession.name}`,
        'Expecting ' + queue.music.toString(),
      );
      return this.stop();
    }
    if (queue instanceof Queue) await this.queues.setPlaying(queue);
    const timeoutEndOfSong = this.calculateWhenBeforeCurrentSongFinish(
      playState.currentPlayback,
    );
    this.startTimeout(timeoutEndOfSong, this.SONG_END_SCHEDULER_NAME, () =>
      this.endOfSongEvent(musicSession, queue),
    );
    this.logger.log(`Start of song : ${queue.music.toString()}`);
    this.stopTimeout(this.SONG_START_SCHEDULER_NAME);
  }

  private async getPlayState(musicSession: MusicSession) {
    const response = await this.spotify.getPlaybackState(musicSession, true);
    if (response.status === 'error' || !response.data) {
      throw new ServiceUnavailableException();
    }
    const playState = response.data;
    if (!playState.registered || !playState.currentPlayback?.is_playing) {
      const error = playState.registered
        ? 'Music not playing'
        : 'Spotify not registered';
      this.logger.warn(
        error +
          `, stopping engine for session ${musicSession.publicCode} ${musicSession.name}`,
      );
      this.stop();
      return null;
    }
    return playState;
  }

  // Time related functions

  private startTimeout(timeout: number, name: string, func: () => void) {
    if (this.schedulerRegistry.doesExist('timeout', name)) return;
    const timeoutFunction = setTimeout(func, timeout);
    this.schedulerRegistry.addTimeout(name, timeoutFunction);
  }

  private deleteTimeouts() {
    this.stopTimeout(this.SONG_END_SCHEDULER_NAME);
    this.stopTimeout(this.SONG_START_SCHEDULER_NAME);
    this.stopTimeout(this.FORWARD_MUSIC_RESTART_ENGINE);
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
