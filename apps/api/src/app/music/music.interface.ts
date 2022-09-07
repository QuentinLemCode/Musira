import { Queue } from './queue/queue.entity';
import {
  SpotifyTrackCategory,
  SpotifyURI,
} from './spotify/types/spotify-interfaces';

export interface SpotifyOAuthDTO {
  code: string;
}

export interface Music {
  artist: string;
  title: string;
  album: string;
  uri: SpotifyURI<SpotifyTrackCategory>;
  cover: string;
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
