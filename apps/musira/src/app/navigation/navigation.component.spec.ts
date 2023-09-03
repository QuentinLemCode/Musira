import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MusicSessionsService } from '../sessions/music-sessions.service';
import { UserService } from '../user/user.service';
import { NavigationComponent } from './navigation.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterTestingModule } from '@angular/router/testing';

describe('NavigationComponent', () => {
  let component: NavigationComponent;
  let fixture: ComponentFixture<NavigationComponent>;
  let router: Router;

  const mockUserService = {
    loggedUser: jest.fn(),
    isSessionCreator: jest.fn(),
    logout: jest.fn(),
  };

  const mockMusicSessionsService = {
    currentSession: jest.fn(),
    exitSession: jest.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FontAwesomeModule, RouterTestingModule.withRoutes([])],
      declarations: [NavigationComponent],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: MusicSessionsService, useValue: mockMusicSessionsService },
      ],
    }).compileComponents();

    mockUserService.loggedUser.mockReturnValue({
      isLoggedIn: true,
      username: 'testUser',
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavigationComponent);
    router = TestBed.inject(Router);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize showMenu as false', () => {
    expect(component.showMenu).toBe(false);
  });

  it('should initialize isLogged based on user logged status', () => {
    expect(component.isLogged()).toEqual(true);
  });

  it('should initialize username based on user username', () => {
    expect(component.username()).toEqual('testUser');
  });

  it('should call toggleMenu to change showMenu value', () => {
    component.toggleMenu();
    expect(component.showMenu).toBe(true);
    component.toggleMenu();
    expect(component.showMenu).toBe(false);
  });

  it('should call sessions.currentSession to get current session', () => {
    component.currentSession;
    expect(mockMusicSessionsService.currentSession).toHaveBeenCalled();
  });

  // it('should call user.isSessionCreator to check if user is session creator', () => {
  //   mockMusicSessionsService.currentSession.mockReturnValue({ id: 1 });
  //   mockUserService.isSessionCreator.mockReturnValue(true);
  //   const isCreator = component.isSessionCreator;
  //   expect(mockUserService.isSessionCreator).toHaveBeenCalledWith(1);
  //   expect(isCreator).toBe(true);
  // });

  it('should call sessions.exitSession on exitSession', () => {
    component.exitSession();
    expect(mockMusicSessionsService.exitSession).toHaveBeenCalled();
    expect(component.showMenu).toBe(false);
  });

  it('should call user.logout and navigate to login or session page on logout', async () => {
    const mockCurrentSession = { code: '123' };
    mockUserService.loggedUser.mockReturnValue({ isLoggedIn: true });
    mockMusicSessionsService.currentSession.mockReturnValue(mockCurrentSession);
    jest.spyOn(router, 'navigate').mockReturnValue(Promise.resolve(true));

    await component.logout();

    expect(mockUserService.logout).toHaveBeenCalled();

    expect(router.navigate).toHaveBeenCalledWith([mockCurrentSession.code], {
      replaceUrl: true,
    });

    // Reset mocks
    mockUserService.logout.mockClear();

    // If there's no current session
    mockMusicSessionsService.currentSession.mockReturnValue(null);

    await component.logout();

    expect(mockUserService.logout).toHaveBeenCalled();

    expect(router.navigate).toHaveBeenCalledWith(['/user/login'], {
      replaceUrl: true,
    });

    expect(component.showMenu).toBe(false);
  });
});
