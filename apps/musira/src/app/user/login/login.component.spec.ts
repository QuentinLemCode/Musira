import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { FontAwesomeTestingModule } from '@fortawesome/angular-fontawesome/testing';
import { mockObservable } from '../../../tests/mock';
import { UserService } from '../user.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  const userServiceMock = {
    loggedUser: signal({ isLoggedIn: false }),
    emailLogin: jest.fn(),
    socialLogin: jest.fn(),
  };

  const subEmailLogin = mockObservable(userServiceMock.emailLogin);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        FontAwesomeTestingModule,
      ],
      declarations: [LoginComponent],
      providers: [{ provide: UserService, useValue: userServiceMock }],
    });

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form correctly', () => {
    expect(component.form).toBeDefined();
    expect(component.form.get('email')).toBeInstanceOf(FormControl);
    expect(component.form.get('password')).toBeInstanceOf(FormControl);
  });

  it('should submit form and call emailLogin', () => {
    const mockResponse = { id: 1, name: 'John Doe' };
    component.form.patchValue({
      email: 'test@example.com',
      password: 'password',
    });

    component.submit();
    subEmailLogin.next(mockResponse);

    expect(userServiceMock.emailLogin).toHaveBeenCalledWith(
      'test@example.com',
      'password',
    );
    expect(component.loading).toBe(false);
  });

  it('should handle error on submit', () => {
    const errorMessage = 'Invalid credentials';
    component.form.patchValue({
      email: 'test@example.com',
      password: 'password',
    });

    component.submit();
    subEmailLogin.error({ error: { message: errorMessage } });

    expect(component.form.valid).toBe(true);
    expect(component.loading).toBe(false);
    expect(component.error).toBe(errorMessage);
    expect(component.loading).toBe(false);
  });

  // it('should sign in with Facebook', async () => {
  //   const userMock = {
  //     authToken: 'fakeToken',
  //   } as SocialUser;
  //   jest
  //     .spyOn(authService, 'signIn')
  //     .mockReturnValue(Promise.resolve(userMock));

  //   subSocialLogin.next(null);
  //   await component.signInWithFB();

  //   expect(authService.signIn).toHaveBeenCalledWith(
  //     FacebookLoginProvider.PROVIDER_ID,
  //     { scope: 'email,public_profile' },
  //   );
  //   expect(userServiceMock.socialLogin).toHaveBeenCalledWith(
  //     expect.any(SocialLoginUserDTO),
  //     'fakeToken',
  //   );
  // });
});
