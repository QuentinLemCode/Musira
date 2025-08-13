import { provideHttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { of } from 'rxjs';
import { App } from './app';
import { AuthenticationService } from './authentication/authentication.service';
import { NavigationComponent } from './navigation/navigation.component';
import { DashboardService } from './services/dashboard.service';

describe('App', () => {
  let component: App;
  let fixture: ComponentFixture<App>;

  const mockUserService = {
    refreshTokenIfExpired: jasmine.createSpy('refreshTokenIfExpired'),
    loggedUser: signal({ isLoggedIn: true }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        App,
        HttpClientTestingModule,
        FontAwesomeModule,
        NavigationComponent,
        RouterTestingModule,
      ],
      providers: [
        { provide: AuthenticationService, useValue: mockUserService },
        { provide: DashboardService, useValue: { dashboard$: of(false) } },
        provideHttpClient(),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });
});
