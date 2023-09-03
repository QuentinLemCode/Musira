import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { UserService } from '../user/user.service';
import { AdminGuard } from './admin.guard';
import { signal } from '@angular/core';

describe('AdminGuard', () => {
  let adminGuard: AdminGuard;
  const userServiceMock = {
    loggedUser: signal({ isLoggedIn: true, isAdmin: false }),
  };
  let routerMock: Partial<Router>;

  beforeEach(() => {
    routerMock = {
      navigate: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AdminGuard,
        { provide: UserService, useValue: userServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    adminGuard = TestBed.inject(AdminGuard);
  });

  it('should be created', () => {
    expect(adminGuard).toBeTruthy();
  });

  it('should navigate to home if not an admin', () => {
    adminGuard.canActivate();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should return true if logged in and admin', () => {
    userServiceMock.loggedUser.set({ isLoggedIn: true, isAdmin: true });

    const result = adminGuard.canActivate();

    expect(result).toBe(true);
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });
});
