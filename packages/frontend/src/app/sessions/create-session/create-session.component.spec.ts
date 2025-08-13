import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { MusicSessionsService } from '../music-sessions.service';
import { CreateSessionComponent } from './create-session.component';

describe('CreateSessionComponent', () => {
  let component: CreateSessionComponent;
  let fixture: ComponentFixture<CreateSessionComponent>;

  const mockMusicSessionsService = {
    create: jasmine.createSpy('create'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CreateSessionComponent,
        ReactiveFormsModule,
        HttpClientTestingModule,
      ],
      providers: [
        { provide: MusicSessionsService, useValue: mockMusicSessionsService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize createSessionForm on ngOnInit', () => {
    expect(component.createSessionForm).toBeInstanceOf(FormGroup);
    expect(component.createSessionForm.controls.name).toBeTruthy();
  });

  it('should get name FormControl', () => {
    expect(component.name).toEqual(component.createSessionForm.get('name'));
  });

  it('should call musicSessions.create on createSession', async () => {
    const sessionName = 'Test Session';
    const createSessionDto = { name: sessionName };
    const sub = new Subject();
    const createSessionSpy = mockMusicSessionsService.create.and.returnValue(
      sub.asObservable(),
    );
    component.createSession(sessionName)();
    sub.next({});
    expect(createSessionSpy).toHaveBeenCalled();
  });
});
