import { Component, Input } from '@angular/core';
import { MusicApiService } from '../../services/music-api.service';
import { StorageService } from '../../services/storage.service';
import { CONSTANTS } from '../../constants';

@Component({
  selector: 'musira-spotify-login',
  templateUrl: './spotify-login.component.html',
  styleUrls: ['./spotify-login.component.scss'],
})
export class SpotifyLoginComponent {

  @Input() disabled = false;
  @Input() beforeLoginHandler: () => Promise<void> = async () => void 0;
  @Input() redirect_to = '';

  constructor(private readonly music: MusicApiService, private readonly storage: StorageService) {}

  async login() {
    if(this.disabled) return;
    await this.beforeLoginHandler();
    this.storage.setSessionItem(CONSTANTS.SPOTIFY_LOGIN_REDIRECT_SESSION_KEY, this.redirect_to);
    this.music.getUrlLogin().subscribe({
      next: (url) => {
        window.location.href = url;
      },
    });
  }

}
