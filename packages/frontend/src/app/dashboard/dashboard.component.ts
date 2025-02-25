import { DOCUMENT } from '@angular/common';
import type { AfterViewChecked, ElementRef, OnDestroy } from '@angular/core';
import { Component, Inject, viewChild } from '@angular/core';
import { toCanvas } from 'qrcode';
import { ComponentsModule } from '../components/components.module';
import { DashboardService } from '../services/dashboard.service';
import { MusicSessionsService } from '../sessions/music-sessions.service';
import { codeToString } from '../utils/format-code';

@Component({
  selector: 'musira-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [ComponentsModule],
  standalone: true,
})
export class DashboardComponent implements AfterViewChecked, OnDestroy {
  qrcode = viewChild<ElementRef<HTMLCanvasElement>>('qrcode');

  serverUrl: string;

  constructor(
    @Inject(DOCUMENT) document: Document,
    @Inject(MusicSessionsService)
    private readonly sessions: MusicSessionsService,
    @Inject(DashboardService) private readonly dashboard: DashboardService,
  ) {
    this.dashboard.enable();
    this.serverUrl = document.location.host;
  }

  ngOnDestroy(): void {
    this.dashboard.disable();
  }

  get currentSession() {
    return this.sessions.currentSession();
  }

  get formattedSessionCode() {
    return codeToString(this.currentSession?.code || 0);
  }

  ngAfterViewChecked(): void {
    toCanvas(
      this.qrcode()?.nativeElement,
      'https://' + this.serverUrl + '/' + this.currentSession?.code,
      {
        errorCorrectionLevel: 'H',
        scale: 12,
      },
    );
  }
}
