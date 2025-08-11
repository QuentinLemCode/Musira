import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { JwtInterceptor } from './jwt.interceptor';

describe('JwtInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let originalGetItem: (key: string) => string | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: JwtInterceptor,
          multi: true,
        },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    originalGetItem = window.localStorage.getItem.bind(window.localStorage);
  });

  it('should add Authorization header with token', () => {
    spyOn(window.localStorage, 'getItem').and.returnValue('fakeToken');
    httpClient.get('/api/data').subscribe((response) => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne('/api/data');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fakeToken');
    req.flush({});
  });

  it('should not add Authorization header without token', () => {
    httpClient.get('/api/data').subscribe((response) => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne('/api/data');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  afterEach(() => {
    httpMock.verify();
    // restore getItem
    (window.localStorage.getItem as any).and?.callThrough?.();
  });
});
