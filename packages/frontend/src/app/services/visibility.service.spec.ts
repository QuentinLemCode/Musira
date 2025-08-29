import { DOCUMENT } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { VisibilityService } from './visibility.service';

type VisibilityChangeHandler = () => void;

class FakeDocument {
  visibilityState: DocumentVisibilityState = 'visible';

  private listeners = new Map<string, Set<VisibilityChangeHandler>>();
  public addEventListener = jasmine
    .createSpy('addEventListener')
    .and.callFake((type: string, handler: VisibilityChangeHandler) => {
      if (!this.listeners.has(type)) {
        this.listeners.set(type, new Set());
      }
      this.listeners.get(type)!.add(handler);
    });

  public removeEventListener = jasmine
    .createSpy('removeEventListener')
    .and.callFake((type: string, handler: VisibilityChangeHandler) => {
      this.listeners.get(type)?.delete(handler);
    });

  dispatchVisibilityChange(): void {
    const handlers = Array.from(this.listeners.get('visibilitychange') ?? []);
    handlers.forEach((h) => h());
  }
}

describe('VisibilityService (browser platform)', () => {
  let service: VisibilityService;
  let fakeDoc: FakeDocument;

  beforeEach(() => {
    fakeDoc = new FakeDocument();
    fakeDoc.visibilityState = 'hidden';

    TestBed.configureTestingModule({
      providers: [
        VisibilityService,
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: DOCUMENT, useValue: fakeDoc as unknown as Document },
      ],
    });
    service = TestBed.inject(VisibilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize visibility from document.visibilityState', () => {
    let lastVisible: boolean | undefined;
    const sub = service.change.subscribe((v) => (lastVisible = v.visible));
    expect(lastVisible).toBe(false);
    sub.unsubscribe();
  });

  it('should emit on visibilitychange events', () => {
    let lastVisible: boolean | undefined;
    const sub = service.change.subscribe((v) => (lastVisible = v.visible));

    // Start hidden by setup
    expect(lastVisible).toBe(false);

    // Change to visible and dispatch
    fakeDoc.visibilityState = 'visible';
    fakeDoc.dispatchVisibilityChange();
    expect(lastVisible).toBe(true);

    // Change back to hidden and dispatch
    fakeDoc.visibilityState = 'hidden';
    fakeDoc.dispatchVisibilityChange();
    expect(lastVisible).toBe(false);

    sub.unsubscribe();
  });

  it('should remove the event listener on destroy', () => {
    expect(fakeDoc.addEventListener).toHaveBeenCalledWith(
      'visibilitychange',
      jasmine.any(Function),
    );

    // Capture the handler reference added
    const handler = fakeDoc.addEventListener.calls.argsFor(
      0,
    )[1] as unknown as VisibilityChangeHandler;

    service.ngOnDestroy();
    expect(fakeDoc.removeEventListener).toHaveBeenCalledWith(
      'visibilitychange',
      handler,
    );
  });
});

describe('VisibilityService (server platform / SSR)', () => {
  let service: VisibilityService;
  let fakeDoc: FakeDocument;

  beforeEach(() => {
    fakeDoc = new FakeDocument();
    fakeDoc.visibilityState = 'hidden';

    TestBed.configureTestingModule({
      providers: [
        VisibilityService,
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: DOCUMENT, useValue: fakeDoc as unknown as Document },
      ],
    });
    service = TestBed.inject(VisibilityService);
  });

  it('should not register listeners nor touch document in SSR', () => {
    // On SSR, the service should not add listeners
    expect(fakeDoc.addEventListener).not.toHaveBeenCalled();

    // The default BehaviorSubject value is true and should remain unchanged
    let lastVisible: boolean | undefined;
    const sub = service.change.subscribe((v) => (lastVisible = v.visible));
    expect(lastVisible).toBe(true);
    sub.unsubscribe();
  });
});
