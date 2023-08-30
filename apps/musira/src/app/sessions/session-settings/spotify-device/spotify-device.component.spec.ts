import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { FontAwesomeTestingModule } from '@fortawesome/angular-fontawesome/testing';
import { throwError } from 'rxjs';
import {
  BacklogStubComponent,
  MusicStubComponent,
  QueueStubComponent,
  SearchStubComponent,
  SpotifyLoginStubComponent,
  SpotifyStatusStubComponent,
} from '../../../../tests/components-stubs';
import { mockObservable } from '../../../../tests/mock';
import type { CurrentMusic } from '../../../services/music-api.interface';
import { MusicApiService } from '../../../services/music-api.service';
import { SpotifyDeviceComponent } from './spotify-device.component';

describe('SpotifyDeviceComponent', () => {
  let component: SpotifyDeviceComponent;
  let fixture: ComponentFixture<SpotifyDeviceComponent>;
  let router: Router;

  const mockMusicApiService = {
    getStatus: jest.fn(),
    logoutPlayer: jest.fn(),
  };

  const mockActivatedRoute = {
    snapshot: { params: {} },
  };

  const subStatus = mockObservable(mockMusicApiService.getStatus);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FontAwesomeTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [
        SpotifyDeviceComponent,
        SpotifyStatusStubComponent,
        SpotifyLoginStubComponent,
        QueueStubComponent,
        SearchStubComponent,
        MusicStubComponent,
        BacklogStubComponent,
      ],
      providers: [
        { provide: MusicApiService, useValue: mockMusicApiService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpotifyDeviceComponent);
    router = TestBed.inject(Router);
    component = fixture.componentInstance;
    fixture.detectChanges();
    subStatus.next(null);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize error as an empty string', () => {
    expect(component.error).toBe('');
  });

  it('should initialize musicStatus as null', () => {
    expect(component.musicStatus).toBe(null);
  });

  it('should call router.navigate on back', () => {
    jest
      .spyOn(router, 'navigate')
      .mockImplementation(() => Promise.resolve(true));
    component.back();
    expect(router.navigate).toHaveBeenCalled();
  });

  it('should set error and musicStatus on handleError', () => {
    const mockError = new HttpErrorResponse({
      error: {
        error: 'Error message',
        isSpotifyAccountRegistered: true,
        engineStarted: false,
      },
    });

    component.handleError(mockError);

    expect(component.error).toBe(mockError.error.error);
    expect(component.musicStatus).toEqual({
      isSpotifyAccountRegistered: true,
      engineStarted: false,
    });
  });

  it('should call music.getStatus and set musicStatus on ngOnInit', () => {
    const mockStatus: CurrentMusic = {
      isSpotifyAccountRegistered: true,
      engineStarted: true,
    };

    component.ngOnInit();
    subStatus.next(mockStatus);

    expect(mockMusicApiService.getStatus).toHaveBeenCalled();
    expect(component.musicStatus).toEqual(mockStatus);

    subStatus.next({
      isSpotifyAccountRegistered: false,
      engineStarted: false,
    });

    expect(component.musicStatus).toEqual({
      isSpotifyAccountRegistered: false,
      engineStarted: false,
    });
  });

  it('should call music.logoutPlayer on logoutPlayer', () => {
    mockMusicApiService.logoutPlayer.mockReturnValue(throwError('Error'));

    component.logoutPlayer();

    expect(mockMusicApiService.logoutPlayer).toHaveBeenCalled();
  });
});
