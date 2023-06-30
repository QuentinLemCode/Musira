import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MusicSessionDto } from '@musira/api-interfaces/sessions/music-session.dto';
import { takeUntil } from 'rxjs';
import { MusicSessionsService } from '../services/music-sessions.service';
import { UserService } from '../services/user.service';
import { UnsubscribableComponent } from '../utils/unsubscribable-component';

@Component({
  selector: 'musira-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent extends UnsubscribableComponent implements OnInit {
  currentSession?: MusicSessionDto | null;

  constructor(
    private readonly user: UserService,
    private readonly sessions: MusicSessionsService,
    private readonly route: ActivatedRoute,
  ) {
    super();
  }

  ngOnInit(): void {
    this.sessions.currentSession$.pipe(takeUntil(this.$destroy)).subscribe({
      next: (session) => {
        this.currentSession = session;
      },
    });

    this.route.params.pipe(takeUntil(this.$destroy)).subscribe({
      next: (params) => {
        if (params['sessionId']) {
          this.sessions.joinSession(params['sessionId']).subscribe();
        } else {
          this.sessions.exitSession();
        }
      },
    });
  }
  exitSession() {
    this.sessions.exitSession();
  }

  get isLoggedIn() {
    return this.user.isLoggedIn;
  }
}
