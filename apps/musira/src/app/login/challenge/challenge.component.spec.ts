import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { EMPTY } from 'rxjs';
import { UserService } from '../../services/user.service';
import { ChallengeFormComponent } from '../challenge-form/challenge-form.component';

import { ChallengeComponent } from './challenge.component';

describe('ChallengeComponent', () => {
  let component: ChallengeComponent;
  let fixture: ComponentFixture<ChallengeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChallengeComponent, ChallengeFormComponent],
      imports: [RouterTestingModule, FormsModule, ReactiveFormsModule],
      providers: [
        {
          provide: UserService,
          useValue: {
            loginWithChallenge: () => EMPTY,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChallengeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
