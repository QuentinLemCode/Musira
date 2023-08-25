import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import type { MusicSessionDto } from '@musira/api-interfaces/index';
import { of, throwError } from 'rxjs';
import { MusicSessionsService } from '../../services/music-sessions.service';
import { JoinSessionComponent } from './join-session.component';

describe('JoinSessionComponent', () => {
  let component: JoinSessionComponent;
  let fixture: ComponentFixture<JoinSessionComponent>;
  let musicSessionsServiceMock: Partial<MusicSessionsService>;
  let routerMock: Partial<Router>;

  beforeEach(async () => {
    musicSessionsServiceMock = {
      getSessionHistory: jest.fn(),
      joinSession: jest.fn(),
    };

    routerMock = {
      navigate: jest.fn(),
    };

    await TestBed.configureTestingModule({
      declarations: [JoinSessionComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: MusicSessionsService, useValue: musicSessionsServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JoinSessionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should join session successfully', () => {
    const code = '123-456-789';
    component.form.controls.code.setValue(code);
    musicSessionsServiceMock.joinSession = jest.fn(() =>
      of({
        name: 'test',
        code: 123456789,
        creator: 'test',
        linkedToSpotify: true,
      } as MusicSessionDto),
    );

    component.joinSession();

    expect(musicSessionsServiceMock.joinSession).toHaveBeenCalledWith(code);
    expect(routerMock.navigate).toHaveBeenCalledWith([code]);
  });

  it('should handle invalid code during joinSession', () => {
    component.form.controls.code.setValue('');
    component.joinSession();

    expect(musicSessionsServiceMock.joinSession).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should handle error during joinSession', () => {
    const code = '123-456-789';
    component.form.controls.code.setValue(code);
    musicSessionsServiceMock.joinSession = jest.fn(() =>
      throwError(() => 'Some error'),
    );

    component.joinSession();

    expect(musicSessionsServiceMock.joinSession).toHaveBeenCalledWith(code);
    expect(routerMock.navigate).not.toHaveBeenCalled();
    expect(component.joinSessionError).toBe('Ce code de session est invalide');
  });

  // Add more test cases to cover other branches and scenarios
});
