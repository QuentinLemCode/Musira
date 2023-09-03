import { signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import {
  QueueStubComponent,
  SearchStubComponent,
} from '../../../tests/components-stubs';
import { UserService } from '../../user/user.service';
import { MusicSessionsService } from '../music-sessions.service';
import { MusicSessionComponent } from './music-session.component';

describe('MusicSessionComponent', () => {
  let component: MusicSessionComponent;
  let fixture: ComponentFixture<MusicSessionComponent>;
  let userServiceMock: Partial<UserService>;
  let musicSessionsServiceMock: Partial<MusicSessionsService>;

  beforeEach(async () => {
    userServiceMock = {
      loggedUser: signal({ isLoggedIn: false }),
    };

    musicSessionsServiceMock = {
      exitSession: jest.fn(),
      currentSession: signal(null),
    };

    await TestBed.configureTestingModule({
      declarations: [
        MusicSessionComponent,
        QueueStubComponent,
        SearchStubComponent,
      ],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: MusicSessionsService, useValue: musicSessionsServiceMock },
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
