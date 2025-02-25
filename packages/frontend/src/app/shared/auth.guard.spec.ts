import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';
import { AuthGuard } from './auth.guard';
import { signal } from '@angular/core';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  const userServiceMock = {
    loggedUser: signal({ isLoggedIn: false }),
  };
  let routerMock: Partial<Router>;

  beforeEach(() => {
    routerMock = {
      navigate: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthenticationService, useValue: userServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    authGuard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(authGuard).toBeTruthy();
  });

  it('should navigate to login if not logged in', () => {
    authGuard.canActivate();

    expect(routerMock.navigate).toHaveBeenCalledWith(['user', 'login']);
  });

  it('should return true if logged in', () => {
    userServiceMock.loggedUser.set({ isLoggedIn: true });

    const result = authGuard.canActivate();

    expect(result).toBe(true);
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });
});
