import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Visibility {
  visible: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class VisibilityService {
  private readonly $visibility = new BehaviorSubject<Visibility>({
    visible: true,
  });

  get change() {
    return this.$visibility.asObservable();
  }

  constructor() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.$visibility.next({ visible: true });
      } else {
        this.$visibility.next({ visible: false });
      }
    });
  }
}
