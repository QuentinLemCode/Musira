import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { MusicSessionsService } from '../music-sessions.service';
import { CreateSessionComponent } from './create-session.component';
import { ComponentsModule } from '../../components/components.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('CreateSessionComponent', () => {
  let component: CreateSessionComponent;
  let fixture: ComponentFixture<CreateSessionComponent>;

  const mockMusicSessionsService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateSessionComponent],
      imports: [ReactiveFormsModule, ComponentsModule, HttpClientTestingModule],
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
    const createSessionSpy = mockMusicSessionsService.create.mockReturnValue(
      sub.asObservable(),
    );
    component.createSession(sessionName)();
    sub.next({});
    expect(createSessionSpy).toHaveBeenCalledWith(createSessionDto);
  });
});
