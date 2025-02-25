import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { StorageService } from '../services/storage.service';
import { JwtInterceptor } from './jwt.interceptor';

describe('JwtInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let storageService: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: JwtInterceptor,
          multi: true,
        },
        {
          provide: StorageService,
          useValue: {
            getLocalItem: jest.fn(),
          },
        },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    storageService = TestBed.inject(StorageService);
  });

  it('should add Authorization header with token', () => {
    jest.spyOn(storageService, 'getLocalItem').mockReturnValue('fakeToken');
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
  });
});
