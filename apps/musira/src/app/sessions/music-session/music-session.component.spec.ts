import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { MusicSessionComponent } from './music-session.component';
import { UserService } from '../../user/user.service';
import { MusicSessionsService } from '../music-sessions.service';
import { signal } from '@angular/core';

describe('MusicSessionComponent', () => {
  let component: MusicSessionComponent;
  let fixture: ComponentFixture<MusicSessionComponent>;
  let userServiceMock: Partial<UserService>;
  let musicSessionsServiceMock: Partial<MusicSessionsService>;

  beforeEach(async () => {
    userServiceMock = {
      isLoggedIn: false, // Set the initial state as needed
    };

    musicSessionsServiceMock = {
      exitSession: jest.fn(),
      currentSession: signal(null),
    };

    await TestBed.configureTestingModule({
      declarations: [MusicSessionComponent],
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
    component.currentSession;

    expect(musicSessionsServiceMock.currentSession).toHaveBeenCalled();
  });

  it('should indicate user is not logged in', () => {
    const isLoggedIn = component.isLoggedIn;

    expect(isLoggedIn).toBe(false);
  });

  // Add more test cases as needed
});
