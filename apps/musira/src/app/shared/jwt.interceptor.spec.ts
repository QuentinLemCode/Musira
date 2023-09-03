import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { mockObservable } from '../../tests/mock';
import { UserService } from '../user/user.service';
import { JwtInterceptor } from './jwt.interceptor';

describe('JwtInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  const userServiceMock = {
    loggedUser: signal({ isLoggedIn: true, token: 'fakeToken' }),
    refreshTokenIfExpired: jest.fn(),
  };

  const subRefresh = mockObservable(userServiceMock.refreshTokenIfExpired);

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
    httpClient.get('/api/data').subscribe((response) => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne('/api/data');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fakeToken');
    req.flush({});
  });

  it('should handle 401 error and refresh token', () => {
    httpClient.get('/api/data').subscribe((response) => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne('/api/data');
    req.error(new ProgressEvent('Unauthorized'), {
      status: 401,
    });

    subRefresh.next(true);

    const newReq = httpMock.expectOne('/api/data');
    expect(newReq.request.headers.get('Authorization')).toBe(
      'Bearer fakeToken',
    );
    newReq.flush({});
  });

  it('should handle other errors', () => {
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
    userServiceMock.loggedUser.set({ isLoggedIn: false, token: '' });

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
