import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { withCredentialsInterceptor } from './with-credentials.interceptor';

describe('WithCredentialsInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [withCredentialsInterceptor],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  const apiBase = environment.serverUrl.replace(/\/+$/, '');

  it('should send credentials to API URLs', () => {
    http.get(`${apiBase}/auth/me`).subscribe();

    const req = httpMock.expectOne(`${apiBase}/auth/me`);
    expect(req.request.withCredentials).toBe(true);
    req.flush({});
  });

  it('should send credentials to same-origin /api paths', () => {
    http.get('/api/auth/me').subscribe();

    const req = httpMock.expectOne('/api/auth/me');
    expect(req.request.withCredentials).toBe(true);
    req.flush({});
  });

  it('should not send credentials to third-party URLs', () => {
    http.get('https://accounts.google.com/o/oauth2/v2/auth').subscribe();

    const req = httpMock.expectOne(
      'https://accounts.google.com/o/oauth2/v2/auth',
    );
    expect(req.request.withCredentials).toBe(false);
    req.flush({});
  });
});
