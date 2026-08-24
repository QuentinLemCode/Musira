import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthenticationService } from './authentication.service';

describe('AuthenticationService', () => {
  let userService: AuthenticationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthenticationService],
    });
    localStorage.setItem(
      'expires_at',
      Math.floor(new Date().valueOf() / 1000) + 60 * 60 + '',
    );

    userService = TestBed.inject(AuthenticationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(userService).toBeTruthy();
  });

  it('should perform email login and set the real user state', () => {
    const email = 'test@example.com';
    const password = 'password';

    userService.emailLogin(email, password).subscribe((response) => {
      expect(response).toBeUndefined();
    });

    const req = httpMock.expectOne(
      `${userService['authEndpoint']}/email/login`,
    );
    expect(req.request.method).toBe('POST');
    req.flush({ success: true });

    // emailLogin now fetches /auth/me to populate the auth signal
    const me = httpMock.expectOne(`${userService['authEndpoint']}/me`);
    me.flush({ id: 1, admin: false, email: '', name: 'John Doe', role: 0 });

    const user = userService.loggedUser();
    expect(user.isLoggedIn).toBe(true);
    if (user.isLoggedIn) {
      expect(user.id).toBe(1);
      expect(user.username).toBe('John Doe');
    }
  });
});
