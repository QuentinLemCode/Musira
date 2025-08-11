import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { currentMusicFixture } from '../../../tests/fixtures';
import { mockObservable } from '../../../tests/mock';
import { MusicApiService } from '../../services/music-api.service';
import { QueueService } from '../../services/queue.service';
import { MusicSessionsService } from '../../sessions/music-sessions.service';
import { SpotifyStatusComponent } from './spotify-status.component';

describe('SpotifyStatusComponent', () => {
  let component: SpotifyStatusComponent;
  let fixture: ComponentFixture<SpotifyStatusComponent>;

  const mockMusicApiService = {
    getStatus: jasmine.createSpy('getStatus'),
    startEngine: jasmine.createSpy('startEngine'),
    stopEngine: jasmine.createSpy('stopEngine'),
  };

  const mockQueueService = {
    get: jasmine.createSpy('get'),
    getFullBacklog: jasmine.createSpy('getFullBacklog'),
  };

  const subQueue = mockObservable(
    mockQueueService.get as unknown as jasmine.Spy,
  );
  const subFullbacklog = mockObservable(
    mockQueueService.getFullBacklog as unknown as jasmine.Spy,
  );

  const sessionMock = {
    currentSession: signal(null),
  };

  const subStatus = mockObservable(
    mockMusicApiService.getStatus as unknown as jasmine.Spy,
  );
  const subStart = mockObservable(
    mockMusicApiService.startEngine as unknown as jasmine.Spy,
  );
  const subStop = mockObservable(
    mockMusicApiService.stopEngine as unknown as jasmine.Spy,
  );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SpotifyStatusComponent],
      providers: [
        { provide: MusicApiService, useValue: mockMusicApiService },
        { provide: QueueService, useValue: mockQueueService },
        { provide: MusicSessionsService, useValue: sessionMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpotifyStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    subStatus.next(currentMusicFixture);
    subQueue.next([]);
    subFullbacklog.next([]);
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
