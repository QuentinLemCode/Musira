import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { mockObservable } from '../../../tests/mock';
import {
  SettingsService,
  type SettingsQuery,
} from '../../services/settings.service';
import { MusicSessionsService } from '../music-sessions.service';
import { SessionSettingsComponent } from './session-settings.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SpotifyDeviceStubComponent } from '../../../tests/components-stubs';
import { MusicApiService } from '../../services/music-api.service';
import type { CurrentMusic } from '../../services/music-api.interface';

describe('SessionSettingsComponent', () => {
  let component: SessionSettingsComponent;
  let fixture: ComponentFixture<SessionSettingsComponent>;
  const settingsServiceMock = {
    get: jest.fn(),
    setMaxVote: jest.fn(),
    setMaxQueuableSongPerUser: jest.fn(),
  };

  const routerMock = {
    navigate: jest.fn(),
  };

  const subGet = mockObservable<SettingsQuery>(settingsServiceMock.get);

  const musicSessionsServiceMock = {
    deleteSession: jest.fn(),
  };

  const musicApiMock = {
    getStatus: jest.fn(),
  };
  const subGetMusic = mockObservable<CurrentMusic>(musicApiMock.getStatus);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule],
      declarations: [SessionSettingsComponent, SpotifyDeviceStubComponent],
      providers: [
        { provide: SettingsService, useValue: settingsServiceMock },
        { provide: MusicSessionsService, useValue: musicSessionsServiceMock },
        { provide: MusicApiService, useValue: musicApiMock },
        { provide: Router, useValue: routerMock },
      ],
    });
    const settings = { maxVotes: 5, maxQueuableSongPerUser: 3 };
    settingsServiceMock.get.mockReturnValue(of(settings));
    fixture = TestBed.createComponent(SessionSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    subGet.next({
      maxQueuableSongPerUser: 3,
      maxVotes: 3,
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize settings on ngOnInit', () => {
    expect(component.maxVote).toBe(5);
    expect(component.maxQueuableSongs).toBe(3);
  });

  it('should set max votes', () => {
    const newMaxVotes = 10;
    settingsServiceMock.setMaxVote.mockReturnValue(
      of({ maxVotes: newMaxVotes }),
    );
    component.maxVote = newMaxVotes;

    component.setMaxVotes();

    expect(settingsServiceMock.setMaxVote).toHaveBeenCalledWith(newMaxVotes);
    expect(component.maxVote).toBe(newMaxVotes);
  });

  it('should set max queuable songs', () => {
    const newMaxQueuableSongs = 5;
    settingsServiceMock.setMaxQueuableSongPerUser.mockReturnValue(
      of({ maxQueuableSongPerUser: newMaxQueuableSongs }),
    );
    component.maxQueuableSongs = newMaxQueuableSongs;

    component.setMaxQueuableSongs();

    expect(settingsServiceMock.setMaxQueuableSongPerUser).toHaveBeenCalledWith(
      newMaxQueuableSongs,
    );
    expect(component.maxQueuableSongs).toBe(newMaxQueuableSongs);
  });

  it('should delete session and navigate to home', () => {
    musicSessionsServiceMock.deleteSession.mockReturnValue(of(null));

    component.deleteSession();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);

    expect(musicSessionsServiceMock.deleteSession).toHaveBeenCalled();
  });
});
