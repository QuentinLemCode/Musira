import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MusicApiService } from './music-api.service';
import { MusicSessionsService } from '../sessions/music-sessions.service';

describe('MusicApiService', () => {
  let service: MusicApiService;

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
    service = TestBed.inject(MusicApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
