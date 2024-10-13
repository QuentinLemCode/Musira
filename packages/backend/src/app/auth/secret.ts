import { env } from 'process';

export const jwtSecret = env.JWT_SECRET || 'TheSecretShouldBeInAnEnvVar';
