import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';
import type { JWTPayload } from 'jose';

const JwtParamDecorator = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.jwt as JWTPayload;
  },
);

/**
 * Decorator to get the JWT payload from the request
 */
export const Jwt = (additionalOptions?: any) =>
  JwtParamDecorator(additionalOptions);
