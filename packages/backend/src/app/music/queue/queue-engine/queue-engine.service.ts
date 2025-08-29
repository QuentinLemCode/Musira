import { InjectQueue } from '@nestjs/bullmq';
import {
  GoneException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { Queue as BullQueue } from 'bullmq';
import { MUSIC_ENGINE_QUEUE } from '../../../jobs/jobs.module';
import type { MusicSession } from '../../../music-session/entities/music-session.entity';
import { MusicSessionService } from '../../../music-session/music-session.service';
import type { User } from '../../../users/user.entity';
import { UserRole } from '../../../users/user.entity';
import type { Backlog } from '../../backlog/backlog.entity';
import { BacklogService } from '../../backlog/backlog.service';
import { SpotifyApiService } from '../../spotify/spotify-api/spotify-api.service';
import type { CurrentPlaybackResponse } from '../../spotify/types/spotify-interfaces';
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
    private readonly backlog: BacklogService,
    private readonly sessions: MusicSessionService,
    @InjectQueue(MUSIC_ENGINE_QUEUE)
    private readonly engineQueue: BullQueue,
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
    // schedule engine launch in 5s
    await this.scheduleLaunch(5000, musicSession.id, queue.id, false);
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
    await this.deleteTimeouts();
    const playingQueue = await this.queues.getPlayingQueue();
    if (playingQueue) {
      await this.queues.setFinished(playingQueue);
    }
    await this.spotify.play(musicSession, queue.music.uri);
    await this.queues.setPlaying(queue);
    const nextQueue: Queue = queue;
    await this.scheduleLaunch(10000, musicSession.id, nextQueue.id, true);
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

    await this.deleteTimeouts();
    await this.scheduleEndOfSong(timeoutEndOfSong, musicSession.id, queue.id);
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
    let backlog: Backlog | null = null;
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
    const idToSchedule = nextQueue ? nextQueue.id : (backlog as Backlog).id;
    await this.scheduleStartOfSong(
      timeoutBeginNextSong,
      musicSession.id,
      idToSchedule,
    );
    await this.stopTimeout(this.SONG_END_SCHEDULER_NAME);
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
    await this.scheduleEndOfSong(timeoutEndOfSong, musicSession.id, queue.id);
    this.logger.log(`Start of song : ${queue.music.toString()}`);
    await this.stopTimeout(this.SONG_START_SCHEDULER_NAME);
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

  private async deleteTimeouts() {
    await Promise.all([
      this.stopTimeout(this.SONG_END_SCHEDULER_NAME),
      this.stopTimeout(this.SONG_START_SCHEDULER_NAME),
      this.stopTimeout(this.FORWARD_MUSIC_RESTART_ENGINE),
    ]);
  }

  private async stopTimeout(name: string) {
    const job = await this.engineQueue.getJob(name);
    if (job) await job.remove();
  }

  private async scheduleLaunch(
    delayMs: number,
    musicSessionId: number,
    queueId: number,
    forwarded: boolean,
  ) {
    await this.stopTimeout(this.FORWARD_MUSIC_RESTART_ENGINE);
    await this.engineQueue.add(
      'engine.launch',
      { musicSessionId, queueId, forwarded },
      { jobId: this.FORWARD_MUSIC_RESTART_ENGINE, delay: delayMs },
    );
  }

  private async scheduleEndOfSong(
    delayMs: number,
    musicSessionId: number,
    queueId: number,
  ) {
    await this.stopTimeout(this.SONG_END_SCHEDULER_NAME);
    await this.engineQueue.add(
      'engine.endOfSong',
      { musicSessionId, queueId },
      { jobId: this.SONG_END_SCHEDULER_NAME, delay: delayMs },
    );
  }

  private async scheduleStartOfSong(
    delayMs: number,
    musicSessionId: number,
    queueId: number,
  ) {
    await this.stopTimeout(this.SONG_START_SCHEDULER_NAME);
    await this.engineQueue.add(
      'engine.startOfSong',
      { musicSessionId, queueId },
      { jobId: this.SONG_START_SCHEDULER_NAME, delay: delayMs },
    );
  }

  // Methods invoked by BullMQ processors
  async launchEngineByIds(
    musicSessionId: number,
    queueId: number,
    forwarded = false,
  ) {
    const musicSession = await this.sessions.findOne(musicSessionId);
    if (!musicSession) return;
    const queue = await this.queues.getQueue(queueId);
    if (!queue) return;
    await this.launchEngine(musicSession, queue, forwarded);
  }

  async endOfSongByIds(musicSessionId: number, queueId: number) {
    const musicSession = await this.sessions.findOne(musicSessionId);
    if (!musicSession) return;
    const queue = await this.queues.getQueue(queueId);
    if (!queue) return;
    await this.endOfSongEvent(musicSession, queue);
  }

  async startOfSongByIds(musicSessionId: number, queueOrBacklogId: number) {
    const musicSession = await this.sessions.findOne(musicSessionId);
    if (!musicSession) return;
    // try queue first, then backlog
    const queue = await this.queues.getQueue(queueOrBacklogId);
    if (queue) {
      await this.startOfSongEvent(musicSession, queue);
      return;
    }
    const backlog = await this.backlog['backlog'].findOne({
      where: { id: queueOrBacklogId },
      relations: ['music', 'music_session'],
    });
    if (backlog) {
      await this.startOfSongEvent(musicSession, backlog);
    }
  }

  async forwardCheckByIds(musicSessionId: number, queueId: number) {
    await this.launchEngineByIds(musicSessionId, queueId, true);
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
