import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { UserService } from '../user/user.service';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  const userServiceMock = {
    isLoggedIn: true,
  };
  let routerMock: Partial<Router>;

  beforeEach(() => {
    routerMock = {
      navigate: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: UserService, useValue: userServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    authGuard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(authGuard).toBeTruthy();
  });

  it('should navigate to login if not logged in', () => {
    userServiceMock.isLoggedIn = false;

    authGuard.canActivate();

    expect(routerMock.navigate).toHaveBeenCalledWith(['user', 'login']);
  });

  it('should return true if logged in', () => {
    userServiceMock.isLoggedIn = true;

    const result = authGuard.canActivate();

    expect(result).toBe(true);
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });
});
