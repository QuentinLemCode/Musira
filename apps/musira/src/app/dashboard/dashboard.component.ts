import { DOCUMENT } from '@angular/common';
import type { AfterViewInit, ElementRef } from '@angular/core';
import { Component, Inject, ViewChild } from '@angular/core';
import { toCanvas } from 'qrcode';
import { MusicSessionsService } from '../sessions/music-sessions.service';

@Component({
  selector: 'musira-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements AfterViewInit {
  @ViewChild('qrcode')
  qrcode!: ElementRef<HTMLCanvasElement>;

  serverUrl: string;

  constructor(
    @Inject(DOCUMENT) document: Document,
    @Inject(MusicSessionsService)
    private readonly sessions: MusicSessionsService,
  ) {
    this.serverUrl = document.location.host;
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
