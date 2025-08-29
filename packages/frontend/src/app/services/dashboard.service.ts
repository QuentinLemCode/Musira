import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class DashboardService {
  private readonly dashboardSubject = new BehaviorSubject(false);
  public readonly dashboard$ = this.dashboardSubject.asObservable();
  enable() {
    this.dashboardSubject.next(true);
  }

  disable() {
    this.dashboardSubject.next(false);
  }
}
