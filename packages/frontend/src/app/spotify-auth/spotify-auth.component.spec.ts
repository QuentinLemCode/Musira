import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MusicApiService } from '../services/music-api.service';
import { SpotifyAuthComponent } from './spotify-auth.component';

describe('SpotifyAuthComponent', () => {
  let component: SpotifyAuthComponent;
  let fixture: ComponentFixture<SpotifyAuthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpotifyAuthComponent, RouterTestingModule],
      providers: [
        {
          provide: MusicApiService,
          useValue: {},
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SpotifyAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
