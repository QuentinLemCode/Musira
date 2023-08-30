import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { emailRefreshFixture } from '../../tests/fixtures';
import { mockObservable } from '../../tests/mock';
import { UserService } from '../user/user.service';
import { JwtInterceptor } from './jwt.interceptor';

describe('JwtInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  const userServiceMock = {
    getToken: jest.fn(),
    isEmailLogin: true,
    refreshEmailToken: jest.fn(),
  };

  const subRefresh = mockObservable(userServiceMock.refreshEmailToken);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: JwtInterceptor,
          multi: true,
        },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  it('should add Authorization header with token', () => {
    userServiceMock.getToken.mockReturnValue('fakeToken');

    httpClient.get('/api/data').subscribe((response) => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne('/api/data');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fakeToken');
    req.flush({});
  });

  it('should handle 401 error and refresh token', () => {
    userServiceMock.getToken.mockReturnValue('fakeToken');

    httpClient.get('/api/data').subscribe((response) => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne('/api/data');
    req.error(new ProgressEvent('Unauthorized'), {
      status: 401,
    });

    subRefresh.next(emailRefreshFixture);

    const newReq = httpMock.expectOne('/api/data');
    expect(newReq.request.headers.get('Authorization')).toBe('Bearer token');
    newReq.flush({});
  });

  it('should handle other errors', () => {
    userServiceMock.getToken.mockReturnValue('fakeToken');

    httpClient.get('/api/data').subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
      },
    });

    const req = httpMock.expectOne('/api/data');
    req.error(new ErrorEvent('Internal Server Error'), {
      status: 500,
    });
  });

  it('should not add Authorization header without token', () => {
    userServiceMock.getToken.mockReturnValue(null);

    httpClient.get('/api/data').subscribe((response) => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne('/api/data');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  afterEach(() => {
    httpMock.verify();
  });
});
