type EnvLike = { ORIGIN?: string };

export const DEFAULT_ALLOWED_ORIGINS = [
  'https://musira.fr',
  'https://www.musira.fr',
];

/**
 * Build the CORS configuration for the API.
 *
 * - The ORIGIN env var (comma-separated) adds allowed origins on top of the
 *   defaults, it does not replace them, so a partial env value can never
 *   silently lock out apex/www variants.
 * - Explicit methods list: @fastify/cors' default only allows
 *   GET/HEAD/POST, which breaks browser preflights for DELETE and PUT.
 */
export const buildCorsOptions = (env: EnvLike) => {
  const extraOrigins = (env.ORIGIN ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const origin = Array.from(
    new Set([...DEFAULT_ALLOWED_ORIGINS, ...extraOrigins]),
  );

  return {
    origin,
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    maxAge: 86_400,
  };
};
