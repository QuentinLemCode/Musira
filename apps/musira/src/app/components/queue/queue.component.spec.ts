import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, throwError } from 'rxjs';
import {
  backlogFixture,
  currentMusicFixture,
  queueFixture,
} from '../../../tests/fixtures';
import type {
  Backlog,
  CurrentMusic,
  Queue,
} from '../../services/music-api.interface';
import { MusicApiService } from '../../services/music-api.service';
import { QueueService } from '../../services/queue.service';
import { UserService } from '../../user/user.service';
import type { IconUpdateStatus } from '../music/music.component';
import { QueueComponent } from './queue.component';

describe('QueueComponent', () => {
  let component: QueueComponent;
  let fixture: ComponentFixture<QueueComponent>;

  let subGetQueue: Subject<Queue[]>;
  let subGetBacklog: Subject<Backlog>;
  let subCurrentMusic: Subject<CurrentMusic>;

  const mockQueueService = {
    get: jest.fn(),
    getBacklog: jest.fn(),
    delete: jest.fn(),
    forward: jest.fn(),
  };

  const mockUserService = {
    isAdmin: jest.fn(),
    isLoggedIn: true,
    userId: '1',
  };

  const mockMusicApiService = {
    getStatus: jest.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QueueComponent],
      providers: [
        { provide: QueueService, useValue: mockQueueService },
        { provide: UserService, useValue: mockUserService },
        { provide: MusicApiService, useValue: mockMusicApiService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    subGetQueue = new Subject();
    subGetBacklog = new Subject();
    subCurrentMusic = new Subject();
    mockQueueService.get.mockReturnValue(subGetQueue.asObservable());
    mockQueueService.getBacklog.mockReturnValue(subGetBacklog.asObservable());
    mockMusicApiService.getStatus.mockReturnValue(
      subCurrentMusic.asObservable(),
    );
    fixture = TestBed.createComponent(QueueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('not loaded', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with loading state', () => {
      expect(component.loading).toBe(true);
    });
  });

  describe('load fixtures', () => {
    beforeEach(() => {
      subGetBacklog.next(backlogFixture);
      subGetQueue.next([queueFixture]);
      subCurrentMusic.next(currentMusicFixture);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should load queue and backlog on initialization', () => {
      expect(mockQueueService.get).toHaveBeenCalled();
      expect(mockQueueService.getBacklog).toHaveBeenCalled();
      expect(mockMusicApiService.getStatus).toHaveBeenCalled();

      expect(component.queues).toEqual([]);
      expect(component.playing).toEqual(queueFixture);
      expect(component.backlog).toEqual(backlogFixture);
      expect(component.isEngineStarted).toEqual(true);
      expect(component.loading).toBe(false);
    });

    it('should call queue service to delete', () => {
      const mockIconUpdate: IconUpdateStatus = {
        updateLoading: jest.fn(),
        completeEmitter: jest.fn(),
        updateIcon: jest.fn(),
      };
      const idToDelete = 1;
      const sub = new Subject();
      mockQueueService.delete.mockReturnValue(sub.asObservable());

      component.delete(idToDelete, mockIconUpdate);
      sub.next({});

      expect(mockQueueService.delete).toHaveBeenCalledWith(idToDelete);
      expect(mockIconUpdate.updateLoading).toHaveBeenCalledWith(true);
      expect(mockIconUpdate.completeEmitter).toHaveBeenCalled();
    });

    it('should call queue service to forward (vote)', () => {
      const mockIconUpdate: IconUpdateStatus = {
        updateLoading: jest.fn(),
        completeEmitter: jest.fn(),
        updateIcon: jest.fn(),
      };
      const idToVote = 1;
      const sub = new Subject();
      mockQueueService.forward.mockReturnValue(sub.asObservable());

      component.vote(idToVote, mockIconUpdate);
      sub.next({});

      expect(mockQueueService.forward).toHaveBeenCalledWith(idToVote);
      expect(mockIconUpdate.updateLoading).toHaveBeenCalledWith(false);
      expect(mockIconUpdate.completeEmitter).toHaveBeenCalled();
      expect(component.error).toBe('');
    });

    it('should handle already-voted error when voting', () => {
      jest.useFakeTimers();
      const mockIconUpdate: IconUpdateStatus = {
        updateLoading: jest.fn(),
        completeEmitter: jest.fn(),
        updateIcon: jest.fn(),
      };
      const idToVote = 3;
      const mockError = { error: { cause: 'already-voted' } };
      mockQueueService.forward.mockReturnValue(throwError(() => mockError));

      component.vote(idToVote, mockIconUpdate);

      expect(mockQueueService.forward).toHaveBeenCalledWith(idToVote);
      expect(mockIconUpdate.updateLoading).toHaveBeenCalledWith(true);
      expect(mockIconUpdate.completeEmitter).not.toHaveBeenCalled();
      expect(component.error).toBe('Vous avez déjà voté pour cette musique');

      // Error should be cleared after a timeout
      jest.advanceTimersByTime(5000);
      expect(component.error).toBe('');
    });
  });
});
