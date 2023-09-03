import { TestBed } from '@angular/core/testing';

import { MusicSessionsService } from './music-sessions.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UserService } from '../user/user.service';

describe('MusicSessionsService', () => {
  let service: MusicSessionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: UserService,
          useValue: {},
        },
      ],
    });
    service = TestBed.inject(MusicSessionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
