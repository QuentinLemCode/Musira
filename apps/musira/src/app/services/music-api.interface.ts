type Album = 'album';
type Artist = 'artist';
type Playlist = 'playlist';
type Track = 'track';
type Show = 'show';
type Episode = 'episode';

export type SpotifyAlbumCategory = Album;
export type SpotifyArtistCategory = Artist;
export type SpotifyPlaylistCategory = Playlist;
export type SpotifyTrackCategory = Track;
export type SpotifyShowCategory = Show;
export type SpotifyEpisodeCategory = Episode;

export type SpotifyCategoryID =
  | Album
  | Artist
  | Playlist
  | Track
  | Show
  | Episode;

type SpotifyID = string;

export type SpotifyURI<T extends SpotifyCategoryID = SpotifyCategoryID> =
  `spotify:${T}:${SpotifyID}`;

export interface Music {
  artist: string;
  title: string;
  album: string;
  uri: SpotifyURI<Track>;
  cover: string;
  duration: number;
}

export interface CurrentMusic {
  isSpotifyAccountRegistered: boolean;
  currentPlay?: Music | null;
  queue?: Queue[];
  engineStarted: boolean;
  message?: string;
}

export enum Status {
  PENDING,
  PLAYING,
  FINISHED,
  CANCELLED,
}

export interface Queue {
  id: number;
  status: Status;
  music: Music;
  user: {
    name: string;
    id: number;
  };
  forward_votes: number;
}

export interface QueueResponse {
  queue: Queue[];
  backlog: Backlog | null;
}

export interface Backlog {
  music: Music;
  id: number;
}
