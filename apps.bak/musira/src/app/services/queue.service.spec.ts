import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { QueueService } from './queue.service';
import { MusicSessionsService } from '../sessions/music-sessions.service';

describe('QueueService', () => {
  let service: QueueService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: MusicSessionsService,
          useValue: {},
        },
      ],
    });
    service = TestBed.inject(QueueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
