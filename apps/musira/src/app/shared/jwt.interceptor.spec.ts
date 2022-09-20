import { TestBed } from '@angular/core/testing';
import { UserService } from '../services/user.service';

import { JwtInterceptor } from './jwt.interceptor';

describe('JwtInterceptor', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        JwtInterceptor,
        {
          provide: UserService,
          useValue: {
            getToken: () => '123',
          },
        },
      ],
    })
  );

  it('should be created', () => {
    const interceptor: JwtInterceptor = TestBed.inject(JwtInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
