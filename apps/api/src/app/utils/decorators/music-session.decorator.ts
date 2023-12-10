import type { ExecutionContext } from '@nestjs/common';
import { BadRequestException, createParamDecorator } from '@nestjs/common';
import { MusicSessionPipe } from '../pipes/music-session.pipe.js';

const parseCode = (code: string) => {
  try {
    return Number.parseInt(code, 10);
  } catch {
    throw new BadRequestException('Bad session public code format');
  }
};

export const publicCodeFromRequest = (ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const code = request.params?.publicCode;
  if (!code) return null;
  return parseCode(code);
};

export const PublicCode = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    return publicCodeFromRequest(ctx);
  },
);

/**
 * Format : ':publicCode'
 *
 * Decorator to get the session public code from the request
 */
export const MusicSessionParam = (additionalOptions?: any) =>
  PublicCode(additionalOptions, MusicSessionPipe);
