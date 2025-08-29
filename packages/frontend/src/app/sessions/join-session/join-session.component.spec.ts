import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Subject } from 'rxjs';
import { MusicSessionsService } from '../music-sessions.service';
import { JoinSessionComponent } from './join-session.component';

describe('JoinSessionComponent', () => {
  let component: JoinSessionComponent;
  let fixture: ComponentFixture<JoinSessionComponent>;

  const mockMusicSessionsService = {
    joinSession: jasmine.createSpy('joinSession'),
    getSessionHistory: jasmine
      .createSpy('getSessionHistory')
      .and.returnValue([]),
    deleteSessionInHistory: jasmine.createSpy('deleteSessionInHistory'),
  };

  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinSessionComponent, ReactiveFormsModule, RouterTestingModule],
      providers: [
        { provide: MusicSessionsService, useValue: mockMusicSessionsService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(JoinSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    mockMusicSessionsService.getSessionHistory.calls.reset();
    mockMusicSessionsService.joinSession.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should join session with valid code', () => {
    const code = '123-456-789';
    spyOn(router, 'navigate');
    const sub = new Subject();
    const joinSessionSpy = mockMusicSessionsService.joinSession.and.returnValue(
      sub.asObservable(),
    );
    component.form.controls.code.setValue(code);
    expect(component.form.valid).toBeTruthy();
    component.joinSession();
    sub.next({});
    expect(joinSessionSpy).toHaveBeenCalledWith(123456789);
    expect(router.navigate).toHaveBeenCalledWith([123456789]);
  });

  it('should show an error when joining session fail', () => {
    component.form.controls.code.setValue('invalid-code');
    component.form.controls.code.markAsTouched();
    fixture.detectChanges();
    component.joinSession();
    expect(mockMusicSessionsService.joinSession).not.toHaveBeenCalled();
    expect(
      fixture.debugElement.query(By.css('#form-error')).nativeElement
        .textContent,
    ).toContain('Le code de session doit comporter 9 chiffres.');
  });

  it('should show an error when code is invalid', () => {
    const sub = new Subject();
    const joinSessionSpy = mockMusicSessionsService.joinSession.and.returnValue(
      sub.asObservable(),
    );
    component.form.controls.code.setValue('123-456-789');
    component.joinSession();
    sub.error({});
    expect(joinSessionSpy).toHaveBeenCalled();
    expect(component.joinSessionError).toBe('Ce code de session est invalide');
  });

  it('should format date using intlFormat', () => {
    const date = new Date('2023-08-29T12:34:56Z');
    const formattedDate = component.formatDate(date);
    expect(formattedDate).toContain('mardi 29 août 2023 à');
  });

  it('should format code using codeToString', () => {
    const code = 123456789;
    const formattedCode = component.formatCode(code);
    expect(formattedCode).toBe('123-456-789');
  });
});
