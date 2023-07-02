import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { musicSessionGuard } from './music-session.guard';

describe('musicSessionGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => musicSessionGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
