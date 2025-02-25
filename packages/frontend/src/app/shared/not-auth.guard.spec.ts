import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NotAuthGuard } from './not-auth.guard';
import { AuthenticationService } from '../authentication/authentication.service';
import { signal } from '@angular/core';

describe('NotAuthGuard', () => {
  let notAuthGuard: NotAuthGuard;
  const routerMock = {
    navigate: jest.fn(),
  };
  const userServiceMock = {
    loggedUser: signal({ isLoggedIn: false }),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NotAuthGuard,
        { provide: AuthenticationService, useValue: userServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    notAuthGuard = TestBed.inject(NotAuthGuard);
  });

  it('should be created', () => {
    expect(notAuthGuard).toBeTruthy();
  });

  it('should allow access if not logged in', () => {
    const result = notAuthGuard.canActivate();

    expect(result).toBe(true);
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should navigate to home if logged in', () => {
    userServiceMock.loggedUser.set({ isLoggedIn: true });

    notAuthGuard.canActivate();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });
});
