import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, OnDestroy, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Visibility {
  visible: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class VisibilityService implements OnDestroy {
  private readonly $visibility = new BehaviorSubject<Visibility>({
    visible: true,
  });
  private visibilityChangeHandler?: () => void;

  get change() {
    return this.$visibility.asObservable();
  }

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    @Inject(DOCUMENT) private readonly documentRef: Document,
  ) {
    if (isPlatformBrowser(this.platformId)) {
      // Initialize current state in the browser
      this.$visibility.next({
        visible: this.documentRef.visibilityState === 'visible',
      });

      // Register event listener only in the browser
      this.visibilityChangeHandler = () => {
        const isVisible = this.documentRef.visibilityState === 'visible';
        this.$visibility.next({ visible: isVisible });
      };
      this.documentRef.addEventListener(
        'visibilitychange',
        this.visibilityChangeHandler,
      );
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId) && this.visibilityChangeHandler) {
      this.documentRef.removeEventListener(
        'visibilitychange',
        this.visibilityChangeHandler,
      );
    }
  }
}
