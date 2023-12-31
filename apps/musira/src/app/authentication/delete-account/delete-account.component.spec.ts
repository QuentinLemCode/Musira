import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeleteAccountComponent } from './delete-account.component';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthenticationService } from '../authentication.service';
import { UsersService } from '../../services/users.service';

describe('DeleteAccountComponent', () => {
  let component: DeleteAccountComponent;
  let fixture: ComponentFixture<DeleteAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeleteAccountComponent],
      imports: [RouterTestingModule],
      providers: [
        {
          provide: AuthenticationService,
          useValue: {},
        },
        {
          provide: UsersService,
          useValue: {},
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
