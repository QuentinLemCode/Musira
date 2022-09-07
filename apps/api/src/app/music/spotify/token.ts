export interface Token {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface TokenWithCalculatedExpiration extends Token {
  expiryDate: Date;
}

export interface SpotifyToken extends SpotifyRefreshToken {
  refresh_token: string;
}

export interface SpotifyRefreshToken {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
}

export interface RegisteredPlayer extends SpotifyToken {
  expires_at: number;
}
