import { signal } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeTestingModule } from '@fortawesome/angular-fontawesome/testing';
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { Subject, throwError } from 'rxjs';
import { currentMusicFixture, musicFixture } from '../../../tests/fixtures';
import { AuthenticationService } from '../../authentication/authentication.service';
import { MusicApiService } from '../../services/music-api.service';
import { QueueService } from '../../services/queue.service';
import { MusicSessionsService } from '../../sessions/music-sessions.service';
import type { IconUpdateStatus } from '../music/music.component';
import { SearchComponent } from './search.component';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;

  const mockMusicApiService = {
    search: jasmine.createSpy('search'),
  };

  const mockQueueService = {
    push: jasmine.createSpy('push'),
    pushBacklog: jasmine.createSpy('pushBacklog'),
  };

  const mockUserService = {
    loggedUser: signal({ isLoggedIn: true, isAdmin: true }),
    isSessionCreator: jasmine
      .createSpy('isSessionCreator')
      .and.callFake(() => true),
  };

  const mockSessionService = {
    currentSession: signal({ id: 1 }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchComponent],
      imports: [ReactiveFormsModule, FontAwesomeTestingModule],
      providers: [
        { provide: MusicApiService, useValue: mockMusicApiService },
        { provide: QueueService, useValue: mockQueueService },
        { provide: AuthenticationService, useValue: mockUserService },
        { provide: MusicSessionsService, useValue: mockSessionService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    component.resultsHidden = false;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty results, hideResults false, and loading false', () => {
    expect(component.results).toBeNull();
    expect(component.resultsHidden).toBe(false);
    expect(component.loading).toBe(false);
  });

  it('should initialize musicConfig based on user role', () => {
    const expectedMusicConfig = {
      votable: false,
      deletable: false,
      queueable: true,
      backlog: false,
    };
    expect(component.musicConfig).toEqual(expectedMusicConfig);
  });

  it('should call musicApiService.search and update results on search value changes', fakeAsync(() => {
    const mockSearchQuery = 'test';
    const sub = new Subject();
    mockMusicApiService.search.and.returnValue(sub.asObservable());
    component.search.setValue(mockSearchQuery);
    tick(500);
    sub.next([currentMusicFixture]);
    sub.next([currentMusicFixture]);

    expect(mockMusicApiService.search).toHaveBeenCalledWith(mockSearchQuery);
    const results: unknown = component.results;
    expect(results).toEqual([currentMusicFixture]);
    expect(component.loading).toBe(false);
  }));

  it('should handle error when musicApiService.search fails', fakeAsync(() => {
    const mockSearchQuery = 'test';
    const sub = new Subject();
    mockMusicApiService.search.and.returnValue(sub.asObservable());
    component.search.setValue(mockSearchQuery);
    tick(500);
    sub.error(new Error('Search Error'));
    sub.error(new Error('Search Error'));

    expect(mockMusicApiService.search).toHaveBeenCalledWith(mockSearchQuery);
    expect(component.results).toBeNull();
    expect(component.loading).toBe(false);
    expect(component.error).toBe(SearchComponent.ERROR_MESSAGE);
  }));

  it('should call queueService.push on addToQueue', () => {
    const mockIconUpdate = {
      updateLoading: jasmine.createSpy('updateLoading'),
      updateIcon: jasmine.createSpy('updateIcon'),
      completeEmitter: jasmine.createSpy('completeEmitter'),
    };
    const sub = new Subject();
    mockQueueService.push.and.returnValue(sub.asObservable());

    component.addToQueue(musicFixture, mockIconUpdate);
    sub.next({});

    expect(mockQueueService.push).toHaveBeenCalledWith(musicFixture);
    expect(mockIconUpdate.updateLoading).toHaveBeenCalledWith(true);
    expect(mockIconUpdate.updateIcon).toHaveBeenCalledWith(faCheck);
    expect(mockIconUpdate.updateLoading).toHaveBeenCalledWith(false);
    expect(mockIconUpdate.completeEmitter).toHaveBeenCalled();
  });

  it('should handle queue-related error in addToQueue', () => {
    const mockIconUpdate: IconUpdateStatus = {
      updateLoading: jasmine.createSpy('updateLoading'),
      updateIcon: jasmine.createSpy('updateIcon'),
      completeEmitter: jasmine.createSpy('completeEmitter'),
    };
    const mockError = { error: { cause: 'queue' } };
    mockQueueService.push.and.returnValue(throwError(mockError));

    component.addToQueue(musicFixture, mockIconUpdate);

    expect(mockQueueService.push).toHaveBeenCalledWith(musicFixture);
    expect(mockIconUpdate.updateLoading).toHaveBeenCalledWith(false);
    expect(mockIconUpdate.updateIcon).toHaveBeenCalledWith(faXmark);
    expect(component.error).toBe(SearchComponent.ALREADY_IN_QUEUE);
  });

  it('should clear search input when clicking on cross icon', () => {
    component.search.setValue('test');
    component.hideResults({ clearInput: true });

    expect(component.search.value).toBe(null);
    expect(component.resultsHidden).toBe(true);
  });
});
