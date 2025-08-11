import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { FontAwesomeTestingModule } from '@fortawesome/angular-fontawesome/testing';
import { of } from 'rxjs';
import {
  HomeStubComponent,
  SpotifyDeviceStubComponent,
  SpotifyStatusStubComponent,
} from '../../../tests/components-stubs';
import { mockObservable } from '../../../tests/mock';
import type { CurrentMusic } from '../../services/music-api.interface';
import { MusicApiService } from '../../services/music-api.service';
import {
  SettingsService,
  type SettingsQuery,
} from '../../services/settings.service';
import { MusicSessionsService } from '../music-sessions.service';
import { SessionSettingsComponent } from './session-settings.component';

describe('SessionSettingsComponent', () => {
  let component: SessionSettingsComponent;
  let fixture: ComponentFixture<SessionSettingsComponent>;

  const settingsServiceMock = {
    get: jasmine.createSpy('get'),
    setMaxVote: jasmine.createSpy('setMaxVote'),
    setMaxQueuableSongPerUser: jasmine.createSpy('setMaxQueuableSongPerUser'),
  };

  const subGet = mockObservable<SettingsQuery>(settingsServiceMock.get);

  const musicSessionsServiceMock = {
    deleteSession: jasmine.createSpy('deleteSession'),
  };

  const musicApiMock = {
    getStatus: jasmine.createSpy('getStatus'),
  };
  const subStatus = mockObservable<CurrentMusic>(musicApiMock.getStatus);

  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormsModule,
        FontAwesomeTestingModule,
        RouterTestingModule.withRoutes([
          { path: '', component: HomeStubComponent },
        ]),
      ],
      declarations: [
        SessionSettingsComponent,
        SpotifyDeviceStubComponent,
        SpotifyStatusStubComponent,
      ],
      providers: [
        { provide: SettingsService, useValue: settingsServiceMock },
        { provide: MusicSessionsService, useValue: musicSessionsServiceMock },
        { provide: MusicApiService, useValue: musicApiMock },
      ],
    });
    const settings = { maxVotes: 5, maxQueuableSongPerUser: 3 };
    settingsServiceMock.get.and.returnValue(of(settings));
    fixture = TestBed.createComponent(SessionSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    subGet.next({
      maxQueuableSongPerUser: 3,
      maxVotes: 3,
    });
    subStatus.next({
      isSpotifyAccountRegistered: false,
      engineStarted: false,
    });
    router = TestBed.inject(Router);
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
    settingsServiceMock.setMaxVote.and.returnValue(
      of({ maxVotes: newMaxVotes }),
    );
    component.maxVote = newMaxVotes;

    component.setMaxVotes();

    expect(settingsServiceMock.setMaxVote).toHaveBeenCalledWith(newMaxVotes);
    expect(component.maxVote).toBe(newMaxVotes);
  });

  it('should set max queuable songs', () => {
    const newMaxQueuableSongs = 5;
    settingsServiceMock.setMaxQueuableSongPerUser.and.returnValue(
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
    musicSessionsServiceMock.deleteSession.and.returnValue(of(null));
    spyOn(router, 'navigate').and.callFake(() => Promise.resolve(true));

    component.deleteSession();

    expect(router.navigate).toHaveBeenCalledWith(['/']);

    expect(musicSessionsServiceMock.deleteSession).toHaveBeenCalled();
  });
});
