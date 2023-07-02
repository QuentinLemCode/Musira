import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../services/settings.service';
import { MusicSessionsService } from '../services/music-sessions.service';
import { Router } from '@angular/router';

@Component({
  selector: 'musira-session-settings',
  templateUrl: './session-settings.component.html',
  styleUrls: ['./session-settings.component.scss'],
})
export class SessionSettingsComponent implements OnInit {
  maxVote: number | null = null;
  maxQueuableSongs: number | null = null;
  constructor(
    private readonly settings: SettingsService,
    private readonly sessions: MusicSessionsService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.settings.get().subscribe({
      next: (setting) => {
        this.maxVote = setting.maxVotes;
        this.maxQueuableSongs = setting.maxQueuableSongPerUser;
      },
    });
  }

  setMaxVotes(value: number) {
    this.settings.setMaxVote(value).subscribe({
      next: (vote) => {
        this.maxVote = vote.maxVotes;
      },
    });
  }

  setMaxQueuableSongs(value: number) {
    this.settings.setMaxQueuableSongPerUser(value).subscribe({
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
