import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';

interface User {
  name: string;
  age: number;
}

describe('StorageService', () => {
  let storageService: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StorageService],
    });
    storageService = TestBed.inject(StorageService);
  });

  afterEach(() => {
    storageService.clearLocal();
    storageService.clearSession();
  });

  it('should set and get value in localStorage', () => {
    const key = 'testKey';
    const value: User = { name: 'John', age: 30 };

    storageService.setLocalItem<User>(key, value);
    const retrievedValue = storageService.getLocalItem<User>(key);

    expect(retrievedValue).toEqual(value);
  });

  it('should set and get value in sessionStorage', () => {
    const key = 'testKey';
    const value: User = { name: 'John', age: 30 };

    storageService.setSessionItem<User>(key, value);
    const retrievedValue = storageService.getSessionItem<User>(key);

    expect(retrievedValue).toEqual(value);
  });

  it('should remove value from localStorage', () => {
    const key = 'testKey';
    const value: User = { name: 'John', age: 30 };

    storageService.setLocalItem<User>(key, value);
    storageService.removeLocalItem(key);
    const retrievedValue = storageService.getLocalItem<User>(key);

    expect(retrievedValue).toBeNull();
  });

  it('should remove value from sessionStorage', () => {
    const key = 'testKey';
    const value: User = { name: 'John', age: 30 };

    storageService.setSessionItem<User>(key, value);
    storageService.removeSessionItem(key);
    const retrievedValue = storageService.getSessionItem<User>(key);

    expect(retrievedValue).toBeNull();
  });

  it('should clear localStorage', () => {
    const key = 'testKey';
    const value: User = { name: 'John', age: 30 };

    storageService.setLocalItem<User>(key, value);
    storageService.clearLocal();
    const retrievedValue = storageService.getLocalItem<User>(key);

    expect(retrievedValue).toBeNull();
  });

  it('should clear sessionStorage', () => {
    const key = 'testKey';
    const value: User = { name: 'John', age: 30 };

    storageService.setSessionItem<User>(key, value);
    storageService.clearSession();
    const retrievedValue = storageService.getSessionItem<User>(key);

    expect(retrievedValue).toBeNull();
  });
});
