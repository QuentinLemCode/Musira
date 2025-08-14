import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthModalService } from '../authentication/auth-modal.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { MusicSessionsService } from '../sessions/music-sessions.service';
import { NavigationComponent } from './navigation.component';

describe('NavigationComponent', () => {
  let component: NavigationComponent;
  let fixture: ComponentFixture<NavigationComponent>;
  let router: Router;

  const mockUserService = {
    loggedUser: jasmine.createSpy('loggedUser'),
    isSessionCreator: jasmine.createSpy('isSessionCreator'),
    logout: jasmine.createSpy('logout'),
  };

  const mockMusicSessionsService = {
    currentSession: jasmine.createSpy('currentSession'),
    exitSession: jasmine.createSpy('exitSession'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FontAwesomeModule,
        RouterTestingModule.withRoutes([]),
        NavigationComponent,
      ],
      providers: [
        { provide: AuthenticationService, useValue: mockUserService },
        { provide: MusicSessionsService, useValue: mockMusicSessionsService },
        AuthModalService,
      ],
    }).compileComponents();

    mockUserService.loggedUser.and.returnValue({
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

  it('should call user.logout and close menu on logout', async () => {
    const mockCurrentSession = { code: '123' };
    mockUserService.loggedUser.and.returnValue({ isLoggedIn: true });
    mockMusicSessionsService.currentSession.and.returnValue(mockCurrentSession);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    await component.logout();

    expect(mockUserService.logout).toHaveBeenCalled();
    // No navigation is performed by logout anymore

    // Reset mocks
    mockUserService.logout.calls.reset();

    // If there's no current session
    mockMusicSessionsService.currentSession.and.returnValue(null);

    await component.logout();

    expect(mockUserService.logout).toHaveBeenCalled();
    expect(component.showMenu).toBe(false);
  });
});
