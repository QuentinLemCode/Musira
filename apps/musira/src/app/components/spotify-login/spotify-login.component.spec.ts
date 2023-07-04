import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpotifyLoginComponent } from './spotify-login.component';
import { MusicApiService } from '../../services/music-api.service';
import { StorageService } from '../../services/storage.service';

describe('SpotifyLoginComponent', () => {
  let component: SpotifyLoginComponent;
  let fixture: ComponentFixture<SpotifyLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SpotifyLoginComponent],
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

    fixture = TestBed.createComponent(SpotifyLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
