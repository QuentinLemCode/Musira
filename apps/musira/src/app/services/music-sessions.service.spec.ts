import { TestBed } from '@angular/core/testing';

import { MusicSessionsService } from './music-sessions.service';

describe('MusicSessionsService', () => {
  let service: MusicSessionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MusicSessionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
