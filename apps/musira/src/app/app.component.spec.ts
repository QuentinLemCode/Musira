import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AppComponent } from './app.component';
import { NavigationModule } from './navigation/navigation.module';
import { UserService } from './user/user.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let router: Router;

  const mockUserService = {
    refreshTokenIfExpired: jest.fn(),
    isLoggedIn: true,
    loggedUser: () => ({}),
    username: 'testuser',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [
        HttpClientTestingModule,
        FontAwesomeModule,
        NavigationModule,
        RouterTestingModule,
      ],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    router = TestBed.inject(Router);
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should refresh token if expired and user is logged in', async () => {
    mockUserService.refreshTokenIfExpired.mockReturnValue(
      Promise.resolve(true),
    );
    await component.ngOnInit();
    expect(mockUserService.refreshTokenIfExpired).toHaveBeenCalled();
  });

  it('should navigate to login if not logged in', async () => {
    jest.spyOn(router, 'navigate').mockReturnValueOnce(Promise.resolve(true));
    mockUserService.refreshTokenIfExpired.mockReturnValue(
      Promise.resolve(false),
    );
    await component.ngOnInit();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      replaceUrl: true,
    });
  });
});
