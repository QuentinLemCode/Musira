import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, InjectionToken, PLATFORM_ID } from '@angular/core';

export const BROWSER_STORAGE = new InjectionToken<Storage>('Browser Storage', {
  providedIn: 'root',
  factory: () => localStorage,
});

export const BROWSER_SESSION_STORAGE = new InjectionToken<Storage>(
  'Browser Session Storage',
  {
    providedIn: 'root',
    factory: () => sessionStorage,
  },
);

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly local = inject(BROWSER_STORAGE);
  private readonly session = inject(BROWSER_SESSION_STORAGE);
  private localStorageHandler = this.isBrowser ? this.local : null;
  private sessionStorageHandler = this.isBrowser ? this.session : null;
  // Save a value to localStorage
  public setLocalItem<T>(key: string, value: T): void {
    this.localStorageHandler?.setItem(key, JSON.stringify(value));
  }

  // Retrieve a value from localStorage
  public getLocalItem<T>(key: string): T | null {
    const item = this.localStorageHandler?.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  // Remove a value from localStorage
  public removeLocalItem(key: string): void {
    this.localStorageHandler?.removeItem(key);
  }

  // Clear localStorage completely
  public clearLocal(): void {
    this.localStorageHandler?.clear();
  }

  // Save a value to sessionStorage
  public setSessionItem<T>(key: string, value: T): void {
    this.sessionStorageHandler?.setItem(key, JSON.stringify(value));
  }

  // Retrieve a value from sessionStorage
  public getSessionItem<T>(key: string): T | null {
    const item = this.sessionStorageHandler?.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  // Remove a value from sessionStorage
  public removeSessionItem(key: string): void {
    this.sessionStorageHandler?.removeItem(key);
  }

  // Clear sessionStorage completely
  public clearSession(): void {
    this.sessionStorageHandler?.clear();
  }
}
