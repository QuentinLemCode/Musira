import { HttpClientTestingModule } from '@angular/common/http/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { QueueComponent } from '../components/queue/queue.component';
import { SearchComponent } from '../components/search/search.component';
import { UserService } from '../services/user.service';
import { MainComponent } from './main.component';
import { MusicSessionComponent } from '../components/music-session/music-session.component';

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        FontAwesomeModule,
      ],
      declarations: [
        MainComponent,
        QueueComponent,
        SearchComponent,
        MusicSessionComponent,
      ],
      providers: [
        {
          provide: UserService,
          useValue: {
            isLoggedIn: true,
            isAdmin: () => false,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
