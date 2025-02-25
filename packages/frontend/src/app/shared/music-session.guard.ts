import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MusicSessionsService } from '../sessions/music-sessions.service';

export const musicSessionGuard: CanActivateFn = async (route) => {
  const sessions = inject(MusicSessionsService);

  const sessionId = route.params['sessionId'];
  if (sessionId) {
    const session = await firstValueFrom(sessions.joinSession(sessionId));
    if (session) {
      return true;
    }
  } else {
    sessions.exitSession();
  }
  return false;
};
