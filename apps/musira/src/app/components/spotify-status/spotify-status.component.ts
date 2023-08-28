import { Component, Inject, type OnInit } from '@angular/core';
import { takeUntil } from 'rxjs';
import type { CurrentMusic } from '../../services/music-api.interface';
import { MusicApiService } from '../../services/music-api.service';
import { UnsubscribableComponent } from '../../utils/unsubscribable-component';

@Component({
  selector: 'musira-spotify-status',
  templateUrl: './spotify-status.component.html',
  styleUrls: ['./spotify-status.component.scss'],
})
export class SpotifyStatusComponent
  extends UnsubscribableComponent
  implements OnInit
{
  constructor(
    @Inject(MusicApiService) private readonly music: MusicApiService,
  ) {
    super();
  }

  collapsed = false;
  musicStatus: CurrentMusic;

  ngOnInit() {
    this.music
      .getStatus()
      .pipe(takeUntil(this.$destroy))
      .subscribe({
        next: (status) => (this.musicStatus = status),
      });
  }

  startEngine() {
    this.music.startEngine().subscribe();
  }

  stopEngine() {
    this.music.stopEngine().subscribe();
  }
}
