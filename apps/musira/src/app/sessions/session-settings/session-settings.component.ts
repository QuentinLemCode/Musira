import type { OnInit } from '@angular/core';
import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsService } from '../../services/settings.service';
import { MusicSessionsService } from '../music-sessions.service';

@Component({
  selector: 'musira-session-settings',
  templateUrl: './session-settings.component.html',
  styleUrls: ['./session-settings.component.scss'],
})
export class SessionSettingsComponent implements OnInit {
  maxVote: number | null = null;
  maxQueuableSongs: number | null = null;
  constructor(
    @Inject(SettingsService) private readonly settings: SettingsService,
    @Inject(MusicSessionsService)
    private readonly sessions: MusicSessionsService,
    @Inject(Router) private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.settings.get().subscribe({
      next: (setting) => {
        this.maxVote = setting.maxVotes;
        this.maxQueuableSongs = setting.maxQueuableSongPerUser;
      },
    });
  }

  setMaxVotes() {
    if (!this.maxVote) return;
    this.settings.setMaxVote(this.maxVote).subscribe({
      next: (vote) => {
        this.maxVote = vote.maxVotes;
      },
    });
  }

  setMaxQueuableSongs() {
    if (!this.maxQueuableSongs) return;
    this.settings.setMaxQueuableSongPerUser(this.maxQueuableSongs).subscribe({
      next: (vote) => {
        this.maxQueuableSongs = vote.maxQueuableSongPerUser;
      },
    });
  }

  deleteSession() {
    this.sessions.deleteSession().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
    });
  }
}
