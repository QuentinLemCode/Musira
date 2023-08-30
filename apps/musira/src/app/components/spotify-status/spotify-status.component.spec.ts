import { ComponentFixture, TestBed } from '@angular/core/testing';
import { currentMusicFixture } from '../../../tests/fixtures';
import { mockObservable } from '../../../tests/mock';
import { MusicApiService } from '../../services/music-api.service';
import { SpotifyStatusComponent } from './spotify-status.component';

describe('SpotifyStatusComponent', () => {
  let component: SpotifyStatusComponent;
  let fixture: ComponentFixture<SpotifyStatusComponent>;

  const mockMusicApiService = {
    getStatus: jest.fn(),
    startEngine: jest.fn(),
    stopEngine: jest.fn(),
  };

  const subStatus = mockObservable(mockMusicApiService.getStatus);
  const subStart = mockObservable(mockMusicApiService.startEngine);
  const subStop = mockObservable(mockMusicApiService.stopEngine);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SpotifyStatusComponent],
      providers: [{ provide: MusicApiService, useValue: mockMusicApiService }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpotifyStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    subStatus.next(currentMusicFixture);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize collapsed as false', () => {
    expect(component.collapsed).toBe(false);
  });

  it('should initialize musicStatus based on getStatus', () => {
    expect(component.musicStatus).toEqual(currentMusicFixture);

    subStatus.next({
      engineStarted: false,
      isSpotifyAccountRegistered: true,
    });

    expect(component.musicStatus?.engineStarted).toBe(false);
  });

  it('should call music.startEngine on startEngine', () => {
    component.startEngine();
    subStart.next({});

    expect(mockMusicApiService.startEngine).toHaveBeenCalled();
  });

  it('should call music.stopEngine on stopEngine', () => {
    component.stopEngine();
    subStop.next({});

    expect(mockMusicApiService.stopEngine).toHaveBeenCalled();
  });
});
