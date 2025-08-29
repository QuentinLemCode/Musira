import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MusicSessionsService } from '../sessions/music-sessions.service';
import { MusicApiService } from './music-api.service';

describe('MusicApiService', () => {
  let service: MusicApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: MusicSessionsService,
          useValue: { currentSession$: of({ linkedToSpotify: false }) },
        },
      ],
    });
    service = TestBed.inject(MusicApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
