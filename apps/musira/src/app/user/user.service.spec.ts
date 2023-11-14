import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let userService: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService],
    });
    localStorage.setItem(
      'expires_at',
      Math.floor(new Date().valueOf() / 1000) + 60 * 60 + '',
    );

    userService = TestBed.inject(UserService);
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
      `${userService['usersEndpoint']}/email/login`,
    );
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
});
