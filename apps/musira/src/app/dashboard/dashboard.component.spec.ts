import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as qrcode from 'qrcode';
import { QueueStubComponent } from '../../tests/components-stubs';
import { DashboardService } from '../services/dashboard.service';
import { MusicSessionsService } from '../sessions/music-sessions.service';
import { DashboardComponent } from './dashboard.component';

jest.mock('qrcode', () => ({
  toCanvas: jest.fn(),
}));

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  const mockMusicSessionsService = {
    currentSession: jest.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardComponent, QueueStubComponent],
      providers: [
        { provide: MusicSessionsService, useValue: mockMusicSessionsService },
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
    expect(component.serverUrl).toBe('localhost');
  });

  it('should call toCanvas with correct parameters on ngAfterViewInit', () => {
    const mockCanvasElement = document.createElement('canvas');
    const mockCurrentSession = { code: '123456' };
    mockMusicSessionsService.currentSession.mockReturnValue(mockCurrentSession);
    component.qrcode = new ElementRef(mockCanvasElement);

    component.ngAfterViewChecked();

    expect(qrcode.toCanvas).toHaveBeenCalledWith(
      mockCanvasElement,
      'https://' + component.serverUrl + '/' + mockCurrentSession.code,
      {
        errorCorrectionLevel: 'H',
        scale: 12,
      },
    );
  });
});
