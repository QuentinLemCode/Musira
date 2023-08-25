import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { SessionSettingsComponent } from './session-settings.component';
import { SpotifyDeviceComponent } from './spotify-device/spotify-device.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MusicSessionsService } from '../music-sessions.service';
import {
  SettingsService,
  type SettingsQuery,
} from '../../services/settings.service';

describe('SessionSettingsComponent', () => {
  let component: SessionSettingsComponent;
  let fixture: ComponentFixture<SessionSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        SessionSettingsComponent,
        SessionSettingsComponent,
        SpotifyDeviceComponent,
      ],
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        FormsModule,
      ],
      providers: [
        {
          provide: MusicSessionsService,
          useValue: {},
        },
        {
          provide: SettingsService,
          useValue: {
            get: () =>
              of<SettingsQuery>({ maxVotes: 3, maxQueuableSongPerUser: 3 }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SessionSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
