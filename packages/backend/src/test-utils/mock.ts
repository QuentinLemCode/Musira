import type { CanActivate } from '@nestjs/common';

export const mockJwtGuard: CanActivate = { canActivate: vi.fn(() => true) };
export const mockSessionCreatorGuard: CanActivate = {
  canActivate: vi.fn(() => true),
};
export const mockMusicSessionPipe = {
  transform: vi.fn(),
};
