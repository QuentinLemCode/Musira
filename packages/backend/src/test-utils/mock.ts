import type { CanActivate } from '@nestjs/common';

export const mockJwtGuard: CanActivate = { canActivate: jest.fn(() => true) };
export const mockSessionCreatorGuard: CanActivate = {
  canActivate: jest.fn(() => true),
};
export const mockMusicSessionPipe = {
  transform: jest.fn(),
};
