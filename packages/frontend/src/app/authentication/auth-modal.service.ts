import { Injectable, signal } from '@angular/core';

export type AuthModalMode = 'login' | 'register';

@Injectable({ providedIn: 'root' })
export class AuthModalService {
  public isOpen = signal(false);
  public mode = signal<AuthModalMode>('login');
  public afterSuccess: (() => void) | null = null;

  open(mode: AuthModalMode = 'login', afterSuccess?: () => void) {
    this.mode.set(mode);
    this.afterSuccess = afterSuccess ?? null;
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
    this.afterSuccess = null;
  }

  notifySuccess() {
    const cb = this.afterSuccess;
    this.close();
    if (cb) cb();
  }
}
