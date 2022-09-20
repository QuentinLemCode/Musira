import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { UserService } from '../services/user.service';

import { NotAuthGuard } from './not-auth.guard';

describe('NotAuthGuard', () => {
  let guard: NotAuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        {
          provide: UserService,
          useValue: {
            isLoggedIn: true,
          },
        },
      ],
    });
    guard = TestBed.inject(NotAuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
