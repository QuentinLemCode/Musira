import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthenticationService } from '../authentication.service';
import { CallbackComponent } from './callback.component';

describe('CallbackComponent', () => {
  let component: CallbackComponent;
  let mockRouter: Router;
  let mockRoute: ActivatedRoute;
  let mockAuthService: AuthenticationService;
  const mockToken = {
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
              queryParamMap: { get: jasmine.createSpy('get') },
              paramMap: { get: jasmine.createSpy('get') },
            },
          },
        },
        {
          provide: Router,
          useValue: { navigate: jasmine.createSpy('navigate') },
        },
        {
          provide: AuthenticationService,
          useValue: { oAuthLogin: jasmine.createSpy('oAuthLogin') },
        },
      ],
    });
    component = TestBed.inject(CallbackComponent);
    mockRouter = TestBed.inject(Router);
    mockRoute = TestBed.inject(ActivatedRoute);
    mockAuthService = TestBed.inject(AuthenticationService);
    (mockRoute.snapshot.paramMap.get as jasmine.Spy).and.callFake(
      (param: string) => (param === 'provider' ? 'facebook' : null),
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call oAuthLogin and navigate to "/" if code and state are present', () => {
    const code = 'testCode';
    const state = 'testState';
    (mockRoute.snapshot.queryParamMap.get as jasmine.Spy).and.callFake(
      (param: string) => (param === 'code' ? code : state),
    );

    const authServiceSpy = (
      mockAuthService.oAuthLogin as jasmine.Spy
    ).and.returnValue(of(mockToken));
    component.ngOnInit();
    expect(authServiceSpy).toHaveBeenCalledWith('facebook', code, state);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/'], {
      replaceUrl: true,
    });
  });

  it('should handle error when oAuthLogin throws an error', () => {
    const error = { error: { error: 'error_message' } };
    (mockRoute.snapshot.queryParamMap.get as jasmine.Spy).and.returnValue(
      'testCode',
    );
    (mockAuthService.oAuthLogin as jasmine.Spy).and.returnValue(
      throwError(() => error),
    );
    component.ngOnInit();
    expect(component.error).toEqual(error.error.error);
  });

  it('should set error message for invalid request', () => {
    (mockRoute.snapshot.queryParamMap.get as jasmine.Spy).and.returnValue(null);
    component.ngOnInit();
    expect(component.error).toEqual('Invalid request');
  });
});
