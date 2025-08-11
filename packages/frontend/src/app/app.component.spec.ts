import { HttpClientTestingModule } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { AuthenticationService } from './authentication/authentication.service';
import { NavigationModule } from './navigation/navigation.module';
import { DashboardService } from './services/dashboard.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  const mockUserService = {
    refreshTokenIfExpired: jasmine.createSpy('refreshTokenIfExpired'),
    loggedUser: signal({ isLoggedIn: true }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        HttpClientTestingModule,
        FontAwesomeModule,
        NavigationModule,
        RouterTestingModule,
      ],
      providers: [
        { provide: AuthenticationService, useValue: mockUserService },
        { provide: DashboardService, useValue: { dashboard$: of(false) } },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });
});
