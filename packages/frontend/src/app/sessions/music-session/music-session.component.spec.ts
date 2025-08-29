import { provideHttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import {
  QueueStubComponent,
  SearchStubComponent,
} from '../../../tests/components-stubs';
import { AuthenticationService } from '../../authentication/authentication.service';
import { MusicSessionsService } from '../music-sessions.service';
import { MusicSessionComponent } from './music-session.component';

describe('MusicSessionComponent', () => {
  let component: MusicSessionComponent;
  let fixture: ComponentFixture<MusicSessionComponent>;
  let userServiceMock: Partial<AuthenticationService>;
  let musicSessionsServiceMock: Partial<MusicSessionsService>;

  beforeEach(async () => {
    userServiceMock = {
      loggedUser: signal({ isLoggedIn: false }),
    };

    musicSessionsServiceMock = {
      exitSession: jasmine.createSpy('exitSession'),
      currentSession: signal(null),
    };

    await TestBed.configureTestingModule({
      imports: [MusicSessionComponent, QueueStubComponent, SearchStubComponent],
      providers: [
        { provide: AuthenticationService, useValue: userServiceMock },
        { provide: MusicSessionsService, useValue: musicSessionsServiceMock },
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MusicSessionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should retrieve current session', () => {
    const currentSession = component.currentSession;
    expect(currentSession).toBeNull();
  });

  it('should indicate user is not logged in', () => {
    const isLoggedIn = component.isLoggedIn;
    expect(isLoggedIn).toBe(false);
  });
});
