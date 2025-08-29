import { CommonModule, DOCUMENT } from '@angular/common';
import type { AfterViewChecked, ElementRef, OnDestroy } from '@angular/core';
import { Component, Inject, viewChild } from '@angular/core';
import QRCode from 'qrcode-generator';
import { QueueComponent } from '../components/queue/queue.component';
import { DashboardService } from '../services/dashboard.service';
import { MusicSessionsService } from '../sessions/music-sessions.service';
import { codeToString } from '../utils/format-code';

@Component({
  selector: 'musira-dashboard',
  template: `
    <h1>🎉 {{ currentSession?.name }}</h1>
    <h3 class="text-lg">Oranisé par {{ currentSession?.creator }}</h3>
    <h4 class="italic text-right">#{{ formattedSessionCode }}</h4>
    <div #qrcode></div>
    <musira-queue></musira-queue>
  `,
  styles: [``],
  imports: [CommonModule, QueueComponent],
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
    const qr = QRCode(0, 'H');
    qr.addData('https://' + this.serverUrl + '/' + this.currentSession?.code);
    qr.make();
    const qrcode = this.qrcode();
    if (!qrcode) {
      throw new Error('QR code element not found');
    }
    qrcode.nativeElement.innerHTML = qr.createImgTag();
  }
}
