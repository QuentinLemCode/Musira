import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FontAwesomeTestingModule } from '@fortawesome/angular-fontawesome/testing';
import { Subject } from 'rxjs';
import { mockObservable } from '../../../tests/mock';
import { AuthenticationService } from '../authentication.service';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  const userServiceMock = {
    emailRegister: jasmine.createSpy('emailRegister'),
    loggedUser: { set: jasmine.createSpy('set') },
  } as any;
  const routerMock = {
    navigate: jasmine.createSpy('navigate'),
  } as any;

  let subRegister: Subject<unknown>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FontAwesomeTestingModule,
        RegisterComponent,
      ],
      providers: [
        { provide: AuthenticationService, useValue: userServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form correctly', () => {
    expect(component.form).toBeDefined();
    expect(component.form.get('username')).toBeInstanceOf(FormControl);
    expect(component.form.get('email')).toBeInstanceOf(FormControl);
    expect(component.form.get('password')).toBeInstanceOf(FormControl);
    expect(component.form.get('passwordConfirmation')).toBeInstanceOf(
      FormControl,
    );
  });

  it('should set passwordConfirmation validator on ngOnInit', () => {
    const passwordControl = new FormControl('');
    component.form.addControl('password', passwordControl);

    component.ngOnInit();

    const validators = component.form.controls.passwordConfirmation.validator;
    expect(validators).toBeDefined();
  });

  it('should submit form and call emailRegister', () => {
    subRegister = mockObservable(userServiceMock.emailRegister);
    component.form.patchValue({
      username: 'john',
      email: 'test@example.com',
      password: 'password',
      passwordConfirmation: 'password',
    });

    component.submit();
    subRegister.next(null);
    subRegister.complete();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/'], {
      replaceUrl: true,
    });

    expect(userServiceMock.emailRegister).toHaveBeenCalledWith(
      'test@example.com',
      'john',
      'password',
    );
  });

  it('should handle error on submit', () => {
    const errorMessage =
      "Cet email ou ce nom d'utilisateur est déjà pris. Veuillez choisir un autre nom ou revenir sur la page précédente pour vous connecter";
    subRegister = mockObservable(userServiceMock.emailRegister);
    component.form.patchValue({
      username: 'john',
      email: 'test@example.com',
      password: 'password',
      passwordConfirmation: 'password',
    });

    expect(component.form.valid).toBe(true);
    component.submit();
    expect(component.loading).toBe(true);
    subRegister.error({ error: { cause: 'exist' } });
    // The component sets loading=false in the error handler synchronously
    fixture.detectChanges();
    expect(component.loading).toBe(false);
    expect(component.error).toBe(errorMessage);
  });
});
