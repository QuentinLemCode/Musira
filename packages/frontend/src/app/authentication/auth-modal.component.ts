import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { AuthModalService } from './auth-modal.service';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

@Component({
  selector: 'musira-auth-modal',
  standalone: true,
  imports: [CommonModule, LoginComponent, RegisterComponent],
  styles: [
    `
      .overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      .modal {
        width: min(520px, 94vw);
        background: var(--bg-secondary);
        border-radius: 16px;
        padding: 20px 20px 24px;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
        border: 1px solid var(--surface-border);
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }
      .tabs {
        display: inline-flex;
        gap: 4px;
        background: var(--bg-primary);
        border: 1px solid var(--surface-border);
        border-radius: 999px;
        padding: 4px;
        box-shadow: none;
      }
      .tab {
        background: transparent;
        color: var(--font-primary);
        border-radius: 999px;
        padding: 8px 16px;
        border: none;
        box-shadow: none;
      }
      .tab.active {
        background: var(--primary);
        color: #191919;
      }
      .close {
        background: transparent;
        border: 1px solid var(--surface-border);
        width: 32px;
        height: 32px;
        border-radius: 8px;
        color: var(--font-primary);
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
    `,
  ],
  template: `
    @if (isOpen()) {
      <div class="overlay" (click)="onBackdrop()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="header">
            <div class="tabs">
              <button
                class="tab"
                [class.active]="mode() === 'login'"
                (click)="setMode('login')"
              >
                Se connecter
              </button>
              <button
                class="tab"
                [class.active]="mode() === 'register'"
                (click)="setMode('register')"
              >
                Créer un compte
              </button>
            </div>
            <button class="close" (click)="close()" aria-label="Fermer">
              ✕
            </button>
          </div>
          <ng-container [ngSwitch]="mode()">
            <musira-login
              *ngSwitchCase="'login'"
              (success)="onSuccess()"
            ></musira-login>
            <musira-register
              *ngSwitchCase="'register'"
              (success)="onSuccess()"
            ></musira-register>
          </ng-container>
        </div>
      </div>
    }
  `,
})
export class AuthModalComponent {
  private readonly modal = inject(AuthModalService);
  isOpen = computed(() => this.modal.isOpen());
  mode = computed(() => this.modal.mode());

  onBackdrop() {
    this.close();
  }

  setMode(mode: 'login' | 'register') {
    this.modal.mode.set(mode);
  }

  close() {
    this.modal.close();
  }

  onSuccess() {
    this.modal.notifySuccess();
  }
}
