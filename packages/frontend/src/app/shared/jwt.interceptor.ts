import {
  HTTP_INTERCEPTORS,
  type HttpEvent,
  type HttpHandler,
  type HttpInterceptor,
  type HttpRequest,
} from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { StorageService } from '../services/storage.service';

@Injectable({
  providedIn: 'root',
})
export class JwtInterceptor implements HttpInterceptor {
  constructor(
    @Inject(StorageService) private readonly storageService: StorageService,
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    const token = this.getTokenFromLocalStorage();
    if (!token) {
      return next.handle(request);
    }
    request = this.cloneRequest(request, token);
    return next.handle(request);
  }

  private cloneRequest(request: HttpRequest<unknown>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: 'Bearer ' + token,
      },
    });
  }

  private getTokenFromLocalStorage() {
    return this.storageService.getLocalItem<string>('token');
  }
}

export const jwtInterceptor = [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: JwtInterceptor,
    multi: true,
  },
];
