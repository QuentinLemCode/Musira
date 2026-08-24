import { ExecutionContext, HttpException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';
import { RateLimitGuard } from './rate-limit.decorator';

const createContext = (ip = '1.2.3.4', url = '/auth/email/login') => {
  const request = {
    ip,
    url,
    routeOptions: { url },
  } as unknown as FastifyRequest;
  const handler = () => undefined;
  return {
    getHandler: () => handler,
    getClass: () => RateLimitGuard,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
};

describe('RateLimitGuard', () => {
  const reflector = new Reflector();

  const buildGuardWithMetadata = () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue({ max: 3, windowMs: 60_000 });
    return new RateLimitGuard(reflector);
  };

  it('should allow requests below the limit', () => {
    const guard = buildGuardWithMetadata();
    const context = createContext();

    expect(guard.canActivate(context)).toBe(true);
    expect(guard.canActivate(context)).toBe(true);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw 429 once the limit is exceeded', () => {
    const guard = buildGuardWithMetadata();
    const context = createContext('5.6.7.8');

    for (let i = 0; i < 3; i++) guard.canActivate(context);

    expect(() => guard.canActivate(context)).toThrow(HttpException);
    try {
      guard.canActivate(context);
    } catch (err) {
      expect((err as HttpException).getStatus()).toBe(429);
    }
  });

  it('should track buckets per IP', () => {
    const guard = buildGuardWithMetadata();
    const first = createContext('9.9.9.9');
    const second = createContext('8.8.8.8');

    for (let i = 0; i < 3; i++) guard.canActivate(first);

    expect(() => guard.canActivate(first)).toThrow(HttpException);
    expect(guard.canActivate(second)).toBe(true);
  });

  it('should pass through when no rate limit metadata is present', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const guard = new RateLimitGuard(reflector);

    expect(guard.canActivate(createContext())).toBe(true);
  });
});
