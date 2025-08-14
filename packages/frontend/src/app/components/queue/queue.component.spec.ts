import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { BacklogDto, CurrentMusicDto, QueueDto } from '@musira/client';
import { Subject, throwError } from 'rxjs';
import {
  backlogFixture,
  currentMusicFixture,
  queueFixture,
} from '../../../tests/fixtures';
import { AuthenticationService } from '../../authentication/authentication.service';
import { MusicApiService } from '../../services/music-api.service';
import { QueueService } from '../../services/queue.service';
import type { IconUpdateStatus } from '../music/music.component';
import { QueueComponent } from './queue.component';

describe('QueueComponent', () => {
  let component: QueueComponent;
  let fixture: ComponentFixture<QueueComponent>;

  let subGetQueue: Subject<QueueDto[]>;
  let subGetBacklog: Subject<BacklogDto>;
  let subCurrentMusic: Subject<CurrentMusicDto>;

  const mockQueueService = {
    get: jasmine.createSpy('get'),
    getBacklog: jasmine.createSpy('getBacklog'),
    delete: jasmine.createSpy('delete'),
    forward: jasmine.createSpy('forward'),
  };

  const mockUserService = {
    isAdmin: jasmine.createSpy('isAdmin'),
    isLoggedIn: true,
    userId: '1',
  };

  const mockMusicApiService = {
    getStatus: jasmine.createSpy('getStatus'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QueueComponent],
      providers: [
        { provide: QueueService, useValue: mockQueueService },
        { provide: AuthenticationService, useValue: mockUserService },
        { provide: MusicApiService, useValue: mockMusicApiService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    subGetQueue = new Subject();
    subGetBacklog = new Subject();
    subCurrentMusic = new Subject();
    mockQueueService.get.and.returnValue(subGetQueue.asObservable());
    mockQueueService.getBacklog.and.returnValue(subGetBacklog.asObservable());
    mockMusicApiService.getStatus.and.returnValue(
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
      mockQueueService.get.calls?.reset?.();
      mockQueueService.getBacklog.calls?.reset?.();
      mockQueueService.delete.calls?.reset?.();
      mockQueueService.forward.calls?.reset?.();
      mockMusicApiService.getStatus.calls?.reset?.();
    });

    it('should load queue and backlog on initialization', () => {
      expect(mockQueueService.get).toHaveBeenCalled();
      expect(mockQueueService.getBacklog).toHaveBeenCalled();
      expect(mockMusicApiService.getStatus).toHaveBeenCalled();

      expect(component.queues).toEqual([]);
      const playing: unknown = component.playing;
      expect(playing).toEqual(currentMusicFixture.currentPlay);
      expect(component.backlog).toEqual(backlogFixture);
      expect(component.isEngineStarted).toEqual(true);
      expect(component.loading).toBe(false);
    });

    it('should call queue service to delete', () => {
      const mockIconUpdate: IconUpdateStatus = {
        updateLoading: jasmine.createSpy('updateLoading'),
        completeEmitter: jasmine.createSpy('completeEmitter'),
        updateIcon: jasmine.createSpy('updateIcon'),
      };
      const idToDelete = 1;
      const sub = new Subject();
      mockQueueService.delete.and.returnValue(sub.asObservable());

      component.delete(idToDelete, mockIconUpdate);
      sub.next({});

      expect(mockQueueService.delete).toHaveBeenCalledWith(idToDelete);
      expect(mockIconUpdate.updateLoading).toHaveBeenCalledWith(true);
      expect(mockIconUpdate.completeEmitter).toHaveBeenCalled();
    });

    it('should call queue service to forward (vote)', () => {
      const mockIconUpdate: IconUpdateStatus = {
        updateLoading: jasmine.createSpy('updateLoading'),
        completeEmitter: jasmine.createSpy('completeEmitter'),
        updateIcon: jasmine.createSpy('updateIcon'),
      };
      const idToVote = 1;
      const sub = new Subject();
      mockQueueService.forward.and.returnValue(sub.asObservable());

      component.vote(idToVote, mockIconUpdate);
      sub.next({});

      expect(mockQueueService.forward).toHaveBeenCalledWith(idToVote);
      expect(mockIconUpdate.updateLoading).toHaveBeenCalledWith(false);
      expect(mockIconUpdate.completeEmitter).toHaveBeenCalled();
      expect(component.error).toBe('');
    });

    it('should handle already-voted error when voting', () => {
      jasmine.clock().install();
      const mockIconUpdate: IconUpdateStatus = {
        updateLoading: jasmine.createSpy('updateLoading'),
        completeEmitter: jasmine.createSpy('completeEmitter'),
        updateIcon: jasmine.createSpy('updateIcon'),
      };
      const idToVote = 3;
      const mockError = { error: { cause: 'already-voted' } };
      mockQueueService.forward.and.returnValue(throwError(() => mockError));

      component.vote(idToVote, mockIconUpdate);

      expect(mockQueueService.forward).toHaveBeenCalledWith(idToVote);
      expect(mockIconUpdate.updateLoading).toHaveBeenCalledWith(true);
      expect(mockIconUpdate.completeEmitter).not.toHaveBeenCalled();
      expect(component.error).toBe('Vous avez déjà voté pour cette musique');

      // Error should be cleared after a timeout
      jasmine.clock().tick(5000);
      jasmine.clock().uninstall();
      expect(component.error).toBe('');
    });
  });
});
