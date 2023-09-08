import { DOCUMENT } from '@angular/common';
import type { AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { Component, Inject, ViewChild } from '@angular/core';
import { toCanvas } from 'qrcode';
import { MusicSessionsService } from '../sessions/music-sessions.service';
import { codeToString } from '../utils/format-code';
import { DashboardService } from '../services/dashboard.service';

@Component({
  selector: 'musira-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('qrcode')
  qrcode!: ElementRef<HTMLCanvasElement>;

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

  ngAfterViewInit(): void {
    toCanvas(
      this.qrcode.nativeElement,
      'https://' +
        this.serverUrl +
        '/' +
        this.sessions.currentSession()?.code ?? '',
      {
        errorCorrectionLevel: 'H',
        scale: 12,
      },
    );
  }
}
