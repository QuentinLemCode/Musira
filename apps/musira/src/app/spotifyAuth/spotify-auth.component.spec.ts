import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpotifyAuthComponent } from './spotify-auth.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MusicApiService } from '../services/music-api.service';
import { StorageService } from '../services/storage.service';

describe('SpotifyAuthComponent', () => {
  let component: SpotifyAuthComponent;
  let fixture: ComponentFixture<SpotifyAuthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SpotifyAuthComponent],
      imports: [RouterTestingModule],
      providers: [
        {
          provide: MusicApiService,
          useValue: {},
        },
        {
          provide: StorageService,
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
