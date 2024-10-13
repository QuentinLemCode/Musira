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

  it('should perform email login', () => {
    const mockResponse = { id: 1, name: 'John Doe' };
    const email = 'test@example.com';
    const password = 'password';

    userService.emailLogin(email, password).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${userService['authEndpoint']}/email/login`,
    );
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
});
