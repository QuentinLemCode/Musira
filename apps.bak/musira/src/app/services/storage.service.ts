import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  // Save a value to localStorage
  public setLocalItem<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Retrieve a value from localStorage
  public getLocalItem<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  // Remove a value from localStorage
  public removeLocalItem(key: string): void {
    localStorage.removeItem(key);
  }

  // Clear localStorage completely
  public clearLocal(): void {
    localStorage.clear();
  }

  // Save a value to sessionStorage
  public setSessionItem<T>(key: string, value: T): void {
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  // Retrieve a value from sessionStorage
  public getSessionItem<T>(key: string): T | null {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  // Remove a value from sessionStorage
  public removeSessionItem(key: string): void {
    sessionStorage.removeItem(key);
  }

  // Clear sessionStorage completely
  public clearSession(): void {
    sessionStorage.clear();
  }
}
