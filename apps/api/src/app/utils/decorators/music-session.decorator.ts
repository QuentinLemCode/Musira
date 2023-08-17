import type { ExecutionContext } from '@nestjs/common';
import { BadRequestException, createParamDecorator } from '@nestjs/common';
import { MusicSessionPipe } from '../pipes/music-session.pipe';

const parseCode = (code: string) => {
  try {
    return Number.parseInt(code, 10);
  } catch {
    throw new BadRequestException('Bad session public code format');
  }
};

export const PublicCode = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return parseCode(request.params?.publicCode);
  },
);

/**
 * Format : ':publicCode'
 *
 * Decorator to get the session public code from the request
 */
export const MusicSessionParam = (additionalOptions?: any) =>
  PublicCode(additionalOptions, MusicSessionPipe);
