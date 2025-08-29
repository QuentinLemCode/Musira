import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  Inject,
  computed,
  viewChild,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { AuthModalService } from '../authentication/auth-modal.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { MusicSessionsService } from '../sessions/music-sessions.service';

@Component({
  selector: 'musira-navigation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
  ],
  template: `
    <nav class="navbar">
      <div class="navbar-inner">
        <a href="/" class="brand">
          <img class="logo-dark" src="/public/logo-white.webp" alt="Musira" />
          <img class="logo-light" src="/public/logo-dark.webp" alt="Musira" />
          <span>Musira</span>
        </a>
        @if (
          currentSession ||
          isAdmin() ||
          isLogged() ||
          (!isLogged() && !onLoginOrRegisterPage)
        ) {
          <button
            class="menu-toggle"
            (click)="toggleMenu()"
            type="button"
            aria-controls="navbar-default"
            aria-expanded="false"
          >
            <span class="sr-only">Ouvrir menu</span>
            <svg aria-hidden="true" viewBox="0 0 20 20">
              <path d="M2 4h16M2 10h16M2 16h16" />
            </svg>
          </button>
        }
        <div
          class="menu"
          [ngClass]="showMenu ? 'open' : ''"
          id="navbar-default"
        >
          <ul #menuList>
            @if (currentSession) {
              @if (isSessionCreator) {
                <li>
                  <a
                    [routerLink]="[currentSession.code, 'session-settings']"
                    (click)="toggleMenu()"
                    >Paramètre de la session</a
                  >
                </li>
              }
              <li>
                <a (click)="exitSession()">Quitter la session</a>
              </li>
            }

            @if (isAdmin()) {
              <li>
                <a [routerLink]="['/admin']" (click)="toggleMenu()"
                  >Administration</a
                >
              </li>
            }

            @if (isLogged()) {
              <li>
                <p class="user">
                  <fa-icon [icon]="faUser"></fa-icon>{{ username() }}
                </p>
              </li>
              <li>
                <a href="#" (click)="logout(); $event.preventDefault()"
                  >Se déconnecter</a
                >
              </li>
            }
            @if (!isLogged()) {
              <li>
                <a href="#" (click)="openLogin()">Se connecter</a>
              </li>
            }
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: [
    `
      @use '../../colors.scss' as *;
      .navbar {
        position: sticky;
        top: 0;
        z-index: 100;
        backdrop-filter: saturate(150%) blur(8px);
        background: var(--navbar-bg);
        border-bottom: 1px solid var(--navbar-border);
      }
      .navbar-inner {
        width: 100%;
        grid-column: 1 / -1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px min(max(2vw, 12px), 24px);
        position: relative;
      }
      .brand {
        display: inline-flex;
        align-items: center;
        text-decoration: none;
        color: var(--font-primary);
        gap: 8px;
      }
      .brand img {
        height: 22px;
        width: auto;
      }
      .brand .logo-light {
        display: none;
      }
      @media (prefers-color-scheme: light) {
        .brand .logo-dark {
          display: none;
        }
        .brand .logo-light {
          display: inline-block;
        }
      }
      .brand span {
        font-weight: 700;
        font-size: 18px;
      }
      .menu-toggle {
        all: unset;
        display: inline-flex;
        background: transparent;
        border-radius: 8px;
        padding: 6px;
        margin-left: auto;
        cursor: pointer;
      }
      .menu-toggle svg {
        width: 22px;
        height: 22px;
        stroke: var(--font-primary);
        stroke-width: 2;
        fill: none;
      }
      .menu {
        display: none;
        position: absolute;
        top: 54px;
        right: 12px;
        background: var(--bg-secondary);
        border: 1px solid var(--navbar-border);
        border-radius: 12px;
        padding: 8px 0;
        width: min(92vw, 320px);
        box-shadow: 0 8px 28px
          color-mix(in srgb, var(--neutral) 40%, transparent);
      }
      .menu.open {
        display: block;
      }
      @media (min-width: 768px) {
        .menu {
          display: block;
          position: static;
          background: transparent;
          border: none;
          padding: 0;
          width: auto;
          box-shadow: none;
        }
      }
      .menu ul {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 0;
        margin: 0;
        padding: 0;
      }
      .menu li + li {
        border-top: 1px solid var(--navbar-border);
      }
      .menu li {
        display: flex;
        align-items: center;
        height: 52px;
      }
      .menu li:first-child {
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
      }
      .menu li:last-child {
        border-bottom-left-radius: 12px;
        border-bottom-right-radius: 12px;
      }
      .menu li {
        min-width: 0;
      }
      .menu a,
      .menu .user {
        display: flex;
        align-items: center;
        width: 100%;
        height: 100%;
        padding: 0 16px;
        line-height: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .menu .user {
        margin: 0;
      }
      .menu a {
        color: var(--font-primary);
        text-decoration: none;
      }
      .menu a:hover {
        color: var(--primary-link-hover);
      }
      .user {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      @media (min-width: 768px) {
        .menu-toggle {
          display: none;
        }
        .menu ul {
          flex-direction: row;
          gap: 24px;
          align-items: center;
          white-space: nowrap;
        }
        .menu li + li {
          border-top: none;
        }
        .menu a,
        .menu .user {
          padding: 0;
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
        }
      }
    `,
  ],
})
export class NavigationComponent {
  showMenu = false;
  isLogged = computed(() => this.user.loggedUser().isLoggedIn);
  faUser = faUser;
  username = computed(() => {
    const user = this.user.loggedUser();
    if (user.isLoggedIn) return user.username;
    return null;
  });
  isAdmin = computed(() => {
    const user = this.user.loggedUser();
    if (user.isLoggedIn) return user.admin;
    return false;
  });

  private menuList = viewChild<ElementRef<HTMLUListElement>>('menuList');
  constructor(
    @Inject(AuthenticationService) readonly user: AuthenticationService,
    @Inject(MusicSessionsService)
    private readonly sessions: MusicSessionsService,
    @Inject(Router) private readonly router: Router,
    @Inject(AuthModalService) private readonly authModal: AuthModalService,
  ) {}

  isListEmpty() {
    return this.menuList()?.nativeElement.children.length === 0;
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  get onLoginOrRegisterPage() {
    return (
      this.router.url.includes('/user/login') ||
      this.router.url.includes('/user/register')
    );
  }

  get currentSession() {
    return this.sessions.currentSession();
  }

  get isSessionCreator() {
    if (!this.currentSession) return false;
    return this.sessions.isCreator();
  }

  exitSession() {
    this.showMenu = false;
    this.sessions.exitSession();
  }

  async logout() {
    await this.user.logout();
    this.showMenu = false;
    return;
  }

  openLogin() {
    this.toggleMenu();
    this.authModal.open('login');
  }
}
