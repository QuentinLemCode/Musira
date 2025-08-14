type EmailRefreshResponseDTO = unknown;
import type {
  BacklogDtoDto,
  CurrentMusicDtoDto,
  MusicDtoDto,
  QueueDtoDto,
} from '@musira/client';
import { QueueDtoDto as QueueDtoType } from '@musira/client';

export const musicFixture: MusicDtoDto = {
  album: 'test',
  artist: 'test',
  cover: 'test',
  duration: 20,
  title: 'test',
  uri: 'spotify:track:refijr',
};

export const queueFixture: QueueDtoDto = {
  id: 1,
  forward_votes: 0,
  music: musicFixture,
  status: QueueDtoType.StatusEnum.NUMBER_1,
  user: {
    id: 1,
    name: 'toto',
  },
};

export const backlogFixture: BacklogDtoDto = {
  id: 1,
  music: musicFixture,
};

export const currentMusicFixture: CurrentMusicDtoDto = {
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
