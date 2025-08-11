import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as qrcode from 'qrcode';
import { of } from 'rxjs';
import { DashboardService } from '../services/dashboard.service';
import { MusicApiService } from '../services/music-api.service';
import { QueueService } from '../services/queue.service';
import { VisibilityService } from '../services/visibility.service';
import { MusicSessionsService } from '../sessions/music-sessions.service';
import { DashboardComponent } from './dashboard.component';

// Wrap in describe to avoid spyOn at module top-level (ensures settable)

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  const mockMusicSessionsService = {
    currentSession: jasmine.createSpy('currentSession'),
  };

  beforeEach(() => {
    // Avoid calling real qrcode implementation in tests
    (qrcode as any).toCanvas = () => Promise.resolve();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent, HttpClientTestingModule],
      providers: [
        { provide: MusicSessionsService, useValue: mockMusicSessionsService },
        // Provide stubs for services used by nested components
        {
          provide: QueueService,
          useValue: { get: () => of([]), getBacklog: () => of(null) },
        },
        {
          provide: MusicApiService,
          useValue: {
            getStatus: () =>
              of({ engineStarted: false, isSpotifyAccountRegistered: false }),
          },
        },
        {
          provide: VisibilityService,
          useValue: { change: { subscribe: () => ({ unsubscribe() {} }) } },
        },
        {
          provide: DashboardService,
          useValue: {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            enable: () => {},
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            disable: () => {},
          },
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have serverUrl initialized with document location host', () => {
    expect(component.serverUrl).toContain('localhost');
  });

  it('should run ngAfterViewChecked without errors', async () => {
    const mockCanvasElement = document.createElement('canvas');
    const mockCurrentSession = { code: '123456' };
    mockMusicSessionsService.currentSession.and.returnValue(mockCurrentSession);
    (component as any).qrcode = () => new ElementRef(mockCanvasElement);
    await component.ngAfterViewChecked();
  });
});
