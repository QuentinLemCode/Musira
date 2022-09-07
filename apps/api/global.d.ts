declare namespace NodeJS {
  export interface ProcessEnv {
    SPOTIFY_CLIENT_ID?: string;
    SPOTIFY_CLIENT_KEY?: string;
    REDIRECT_HOST?: string;
    ORIGIN?: string;
    PORT?: string;
    PREFIX?: string;
    DATABASE_HOST?: string;
    DATABASE_PORT?: string;
    DATABASE_USER?: string;
    DATABASE_PASSWORD?: string;
    DATABASE_NAME?: string;
    NODE_ENV: 'production' | 'developement' | 'build' | 'test';
    DEFAULT_ADMIN_PASSWORD?: string;
    JWT_SECRET?: string;
    JWT_EXPIRATION?: string;
    JWT_REFRESH_SECRET?: string;
    JWT_REFRESH_EXPIRATION?: string;
  }
}

declare namespace Express {
  export interface Request {
    user?: {
      userId: number;
      name: string;
      role: UserRole;
    };
  }
}
