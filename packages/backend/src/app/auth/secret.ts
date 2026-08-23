import { env } from 'process';

function getJwtSecret(): string {
  const secret = env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      'JWT_SECRET environment variable is required. Refusing to start with an insecure default.',
    );
  }
  return secret;
}

export const jwtSecret: string = getJwtSecret();
