import type { Queue } from './queue/queue.entity.js';
import type {
  SpotifyTrackCategory,
  SpotifyURI,
} from './spotify/types/spotify-interfaces.js';

export interface SpotifyOAuthDTO {
  code: string;
  state: string;
}

export interface Music {
  artist: string;
  title: string;
  album: string;
  uri: SpotifyURI<SpotifyTrackCategory>;
  cover: string | undefined;
  duration: number;
}

export interface QueueMusic {
  uri: SpotifyURI<SpotifyTrackCategory>;
}

export interface CurrentMusic {
  isSpotifyAccountRegistered: boolean;
  currentPlay?: Music | null;
  queue?: Queue[];
  engineStarted: boolean;
  message?: string | undefined;
}
