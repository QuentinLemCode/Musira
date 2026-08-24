import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';

interface RateLimitOptions {
  max: number;
  windowMs: number;
}

const RATE_LIMIT_KEY = 'rateLimitOptions';

export const RateLimit = (max: number, windowMs: number) =>
  SetMetadata(RATE_LIMIT_KEY, { max, windowMs } satisfies RateLimitOptions);

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
let lastSweep = 0;

const sweepExpired = (now: number) => {
  // Sweep at most once per minute to bound memory usage
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
};

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.getAllAndOverride<
      RateLimitOptions | undefined
    >(RATE_LIMIT_KEY, [context.getHandler(), context.getClass()]);
    if (!options) return true;

    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const route = request.routeOptions?.url ?? request.url;
    const key = `${request.ip}:${route}`;
    const now = Date.now();
    sweepExpired(now);

    const bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + options.windowMs });
      return true;
    }
    bucket.count += 1;
    if (bucket.count > options.max) {
      const retryAfterSeconds = Math.ceil((bucket.resetAt - now) / 1000);
      throw new HttpException(
        {
          statusCode: 429,
          message: 'Too many requests, please try again later',
          retryAfter: retryAfterSeconds,
        },
        429,
      );
    }
    return true;
  }
}
