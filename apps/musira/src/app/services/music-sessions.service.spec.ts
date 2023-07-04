import { TestBed } from '@angular/core/testing';

import { MusicSessionsService } from './music-sessions.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('MusicSessionsService', () => {
  let service: MusicSessionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(MusicSessionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
