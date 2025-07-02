import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  const userServiceMock = {
    loggedUser: signal({ isLoggedIn: false }),
  };
  let routerMock: Partial<Router>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    routerMock = {
      createUrlTree: jest.fn().mockReturnValue({} as UrlTree),
    };

    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = {} as RouterStateSnapshot;

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthenticationService, useValue: userServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  it('should return true if user is logged in', () => {
    userServiceMock.loggedUser.set({ isLoggedIn: true });

    const result = TestBed.runInInjectionContext(() =>
      authGuard(mockRoute, mockState),
    );

    expect(result).toBe(true);
    expect(routerMock.createUrlTree).not.toHaveBeenCalled();
  });

  it('should create UrlTree to login if user not logged in', () => {
    userServiceMock.loggedUser.set({ isLoggedIn: false });

    const result = TestBed.runInInjectionContext(() =>
      authGuard(mockRoute, mockState),
    );

    expect(result).toBeDefined();
    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/user/login']);
  });
});
