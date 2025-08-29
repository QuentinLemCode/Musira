import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { MusicApiService } from '../../services/music-api.service';
import { SpotifyLoginComponent } from './spotify-login.component';

describe('SpotifyLoginComponent', () => {
  let component: SpotifyLoginComponent;
  let fixture: ComponentFixture<SpotifyLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpotifyLoginComponent],
      providers: [{ provide: MusicApiService, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(SpotifyLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
