import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../authentication.service';
import { CallbackComponent } from './callback.component';
import { type JwtToken, OAuthProvider } from '@musira/api-interfaces';
import { of, throwError } from 'rxjs';

describe('CallbackComponent', () => {
  let component: CallbackComponent;
  let mockRouter: Router;
  let mockRoute: ActivatedRoute;
  let mockAuthService: AuthenticationService;
  const mockToken: JwtToken = {
    accessToken: '123',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CallbackComponent,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: { get: jest.fn() },
              paramMap: { get: jest.fn() },
            },
          },
        },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: AuthenticationService, useValue: { oAuthLogin: jest.fn() } },
      ],
    });
    component = TestBed.inject(CallbackComponent);
    mockRouter = TestBed.inject(Router);
    mockRoute = TestBed.inject(ActivatedRoute);
    mockAuthService = TestBed.inject(AuthenticationService);
    (mockRoute.snapshot.paramMap.get as jest.Mock).mockImplementation(
      (param: string) => {
        return param === 'provider' ? OAuthProvider.FACEBOOK : null;
      },
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call oAuthLogin and navigate to "/" if code and state are present', () => {
    const code = 'testCode';
    const state = 'testState';
    (mockRoute.snapshot.queryParamMap.get as jest.Mock).mockImplementation(
      (param: string) => {
        return param === 'code' ? code : state;
      },
    );

    const authServiceSpy = jest
      .spyOn(mockAuthService, 'oAuthLogin')
      .mockReturnValue(of(mockToken));
    component.ngOnInit();
    expect(authServiceSpy).toHaveBeenCalledWith(
      OAuthProvider.FACEBOOK,
      code,
      state,
    );
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should handle error when oAuthLogin throws an error', () => {
    const error = { error: { error: 'error_message' } };
    (mockRoute.snapshot.queryParamMap.get as jest.Mock).mockReturnValue(
      'testCode',
    );
    jest
      .spyOn(mockAuthService, 'oAuthLogin')
      .mockReturnValue(throwError(() => error));
    component.ngOnInit();
    expect(component.error).toEqual(error.error.error);
  });

  it('should set error message for invalid request', () => {
    (mockRoute.snapshot.queryParamMap.get as jest.Mock).mockReturnValue(null);
    component.ngOnInit();
    expect(component.error).toEqual('Invalid request');
  });
});
