import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';
import { HashIdSessionPipe } from '../pipes/hash-id-session.pipe';

export const ParseHashId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.params.sessionHashId;
  },
);

export const MusicSessionParam = (additionalOptions?: any) =>
  ParseHashId(additionalOptions, HashIdSessionPipe);
