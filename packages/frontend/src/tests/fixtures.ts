type EmailRefreshResponseDTO = unknown;
import type {
  BacklogDto,
  CurrentMusicDto,
  MusicDto,
  QueueDto,
} from '@musira/client';
import { QueueDto as QueueDtoType } from '@musira/client';

export const musicFixture: MusicDto = {
  album: 'test',
  artist: 'test',
  cover: 'test',
  duration: 20,
  title: 'test',
  uri: 'spotify:track:refijr',
};

export const queueFixture: QueueDto = {
  id: 1,
  forward_votes: 0,
  music: musicFixture,
  status: QueueDtoType.StatusEnum.NUMBER_1,
  user: {
    id: 1,
    name: 'toto',
  },
};

export const backlogFixture: BacklogDto = {
  id: 1,
  music: musicFixture,
};

export const currentMusicFixture: CurrentMusicDto = {
  engineStarted: true,
  isSpotifyAccountRegistered: true,
  currentPlay: musicFixture,
  message: { text: 'test' },
  queue: [],
};

export const emailRefreshFixture: EmailRefreshResponseDTO = {
  expiresAt: new Date().getTime() + 1000,
  refreshToken: 'refresh-token',
  token: 'token',
};
