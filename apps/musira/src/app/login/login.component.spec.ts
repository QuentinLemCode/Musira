import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserService } from '../services/user.service';
import { LoginComponent } from './login.component';
import { EMPTY } from 'rxjs';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QueueComponent } from '../components/queue/queue.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginComponent, QueueComponent],
      providers: [
        {
          provide: UserService,
          useValue: {
            register: EMPTY,
            isAdmin: () => false,
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: () => null,
          },
        },
      ],
      imports: [FormsModule, ReactiveFormsModule, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
