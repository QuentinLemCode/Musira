import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  ViewChild,
} from '@angular/core';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-dashboard',
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
    QRCode.toCanvas(this.qrcode.nativeElement, 'https://' + this.serverUrl, {
      errorCorrectionLevel: 'H',
      scale: 12,
    });
  }
}
