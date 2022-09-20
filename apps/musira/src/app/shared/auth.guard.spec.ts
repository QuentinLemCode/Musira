import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: UserService,
          useValue: {
            isLoggedIn: true,
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: () => null,
          },
        },
      ],
    });
    guard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
