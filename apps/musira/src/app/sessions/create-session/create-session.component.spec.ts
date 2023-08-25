import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { CreateSessionComponent } from './create-session.component';
import { MusicSessionsService } from '../../services/music-sessions.service';
import { SpotifyLoginComponent } from '../../components/spotify-login/spotify-login.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('CreateSessionComponent', () => {
  let component: CreateSessionComponent;
  let fixture: ComponentFixture<CreateSessionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule, ReactiveFormsModule],
      declarations: [CreateSessionComponent, SpotifyLoginComponent],
      providers: [
        {
          provide: MusicSessionsService,
          useValue: {},
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
