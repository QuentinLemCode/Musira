import {
  Component,
  ElementRef,
  Inject,
  ViewChild,
  computed,
} from '@angular/core';
import { Router } from '@angular/router';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { MusicSessionsService } from '../sessions/music-sessions.service';
import { AuthenticationService } from '../authentication/authentication.service';

@Component({
  selector: 'musira-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
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

  @ViewChild('menuList', { static: true })
  private menuList: ElementRef<HTMLUListElement>;

  constructor(
    @Inject(AuthenticationService) readonly user: AuthenticationService,
    @Inject(MusicSessionsService)
    private readonly sessions: MusicSessionsService,
    @Inject(Router) private readonly router: Router,
  ) {}

  isListEmpty() {
    return this.menuList.nativeElement.children.length === 0;
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
    if (this.currentSession) {
      return this.router.navigate([this.currentSession.code], {
        replaceUrl: true,
      });
    }
    this.showMenu = false;
    return this.router.navigate(['/user/login'], { replaceUrl: true });
  }
}
