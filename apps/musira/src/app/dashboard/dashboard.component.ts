import { DOCUMENT } from '@angular/common';
import type { AfterViewInit, ElementRef } from '@angular/core';
import { Component, Inject, ViewChild } from '@angular/core';
import { toCanvas } from 'qrcode';

@Component({
  selector: 'musira-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements AfterViewInit {
  @ViewChild('qrcode')
  qrcode!: ElementRef<HTMLCanvasElement>;

  serverUrl: string;

  constructor(@Inject(DOCUMENT) document: Document) {
    this.serverUrl = document.location.host;
  }

  ngAfterViewInit(): void {
    toCanvas(this.qrcode.nativeElement, 'https://' + this.serverUrl, {
      errorCorrectionLevel: 'H',
      scale: 12,
    });
  }
}
