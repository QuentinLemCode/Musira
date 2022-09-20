import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MusicApiService } from './music-api.service';

describe('MusicApiService', () => {
  let service: MusicApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(MusicApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
