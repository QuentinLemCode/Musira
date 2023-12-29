import type { EmailRefreshResponseDTO } from '@musira/api-interfaces';
import {
  Status,
  type Backlog,
  type CurrentMusic,
  type Music,
  type Queue,
} from '../app/services/music-api.interface';

export const musicFixture: Music = {
  album: 'test',
  artist: 'test',
  cover: 'test',
  duration: 20,
  title: 'test',
  uri: 'spotify:track:refijr',
};

export const queueFixture: Queue = {
  id: 1,
  forward_votes: 0,
  music: musicFixture,
  status: Status.PLAYING,
  user: {
    id: 1,
    name: 'toto',
  },
};

export const backlogFixture: Backlog = {
  id: 1,
  music: musicFixture,
};

export const currentMusicFixture: CurrentMusic = {
  engineStarted: true,
  isSpotifyAccountRegistered: true,
  currentPlay: musicFixture,
  message: 'test',
  queue: [],
};

export const emailRefreshFixture: EmailRefreshResponseDTO = {
  expiresAt: new Date().getTime() + 1000,
  refreshToken: 'refresh-token',
  token: 'token',
};
