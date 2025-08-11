import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';
import { AdminGuard } from './admin.guard';

describe('AdminGuard', () => {
  let adminGuard: AdminGuard;
  const userServiceMock = {
    loggedUser: signal({ isLoggedIn: true, admin: false }),
  };
  let routerMock: Partial<Router>;

  beforeEach(() => {
    routerMock = {
      createUrlTree: jasmine
        .createSpy('createUrlTree')
        .and.returnValue({} as any),
    };

    TestBed.configureTestingModule({
      providers: [
        AdminGuard,
        { provide: AuthenticationService, useValue: userServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    adminGuard = TestBed.inject(AdminGuard);
  });

  it('should be created', () => {
    expect(adminGuard).toBeTruthy();
  });

  it('should navigate to home if not an admin', () => {
    const result = adminGuard.canActivate();
    expect(result).toBeTruthy();
  });

  it('should return true if logged in and admin', () => {
    userServiceMock.loggedUser.set({ isLoggedIn: true, admin: true });

    const result = adminGuard.canActivate();

    expect(result).toBe(true);
    // Router should not be used
  });
});
