import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeTestingModule } from '@fortawesome/angular-fontawesome/testing';
import { faAdd, faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { Subject, throwError } from 'rxjs';
import { currentMusicFixture, musicFixture } from '../../../tests/fixtures';
import { MusicApiService } from '../../services/music-api.service';
import { QueueService } from '../../services/queue.service';
import { MusicSessionsService } from '../../sessions/music-sessions.service';
import { UserService } from '../../user/user.service';
import type { IconUpdateStatus } from '../music/music.component';
import { SearchComponent } from './search.component';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;

  const mockMusicApiService = {
    search: jest.fn(),
  };

  const mockQueueService = {
    push: jest.fn(),
    pushBacklog: jest.fn(),
  };

  const mockUserService = {
    loggedUser: signal({ isLoggedIn: true, isAdmin: true }),
    isSessionCreator: jest.fn().mockImplementation(() => true),
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
        { provide: UserService, useValue: mockUserService },
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

  it('should call musicApiService.search and update results on search value changes', () => {
    jest.useFakeTimers();
    const mockSearchQuery = 'test';
    const sub = new Subject();
    mockMusicApiService.search.mockReturnValue(sub.asObservable());
    component.search.setValue(mockSearchQuery);
    jest.advanceTimersByTime(500);
    sub.next([currentMusicFixture]);

    expect(mockMusicApiService.search).toHaveBeenCalledWith(mockSearchQuery);
    expect(component.results).toEqual([currentMusicFixture]);
    expect(component.loading).toBe(false);
  });

  it('should handle error when musicApiService.search fails', async () => {
    jest.useFakeTimers();
    const mockSearchQuery = 'test';
    const sub = new Subject();
    mockMusicApiService.search.mockReturnValue(sub.asObservable());
    component.search.setValue(mockSearchQuery);
    jest.advanceTimersByTime(500);
    sub.error(new Error('Search Error'));

    expect(mockMusicApiService.search).toHaveBeenCalledWith(mockSearchQuery);
    expect(component.results).toBeNull();
    expect(component.loading).toBe(false);
    expect(component.error).toBe(SearchComponent.ERROR_MESSAGE);
  });

  it('should call queueService.push on addToQueue', () => {
    const mockIconUpdate = {
      updateLoading: jest.fn(),
      updateIcon: jest.fn(),
      completeEmitter: jest.fn(),
    };
    const sub = new Subject();
    mockQueueService.push.mockReturnValue(sub.asObservable());

    component.addToQueue(musicFixture, mockIconUpdate);
    sub.next({});

    expect(mockQueueService.push).toHaveBeenCalledWith(musicFixture);
    expect(mockIconUpdate.updateLoading).toHaveBeenCalledWith(true);
    expect(mockIconUpdate.updateIcon).toHaveBeenCalledWith(faCheck);
    expect(mockIconUpdate.updateLoading).toHaveBeenCalledWith(false);
    expect(mockIconUpdate.completeEmitter).toHaveBeenCalled();
  });

  it('should handle queue-related error in addToQueue', () => {
    jest.useFakeTimers();
    const mockIconUpdate: IconUpdateStatus = {
      updateLoading: jest.fn(),
      updateIcon: jest.fn(),
      completeEmitter: jest.fn(),
    };
    const mockError = { error: { cause: 'queue' } };
    mockQueueService.push.mockReturnValue(throwError(mockError));

    component.addToQueue(musicFixture, mockIconUpdate);

    expect(mockQueueService.push).toHaveBeenCalledWith(musicFixture);
    expect(mockIconUpdate.updateLoading).toHaveBeenCalledWith(false);
    expect(mockIconUpdate.updateIcon).toHaveBeenCalledWith(faXmark);
    expect(component.error).toBe(SearchComponent.ALREADY_IN_QUEUE);

    jest.advanceTimersByTime(5000);
    expect(component.error).toBe('');
    expect(mockIconUpdate.updateIcon).toHaveBeenCalledWith(faAdd);
  });
});
