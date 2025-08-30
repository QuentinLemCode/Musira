import {
  HTTP_INTERCEPTORS,
  type HttpEvent,
  HttpHandler,
  type HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class WithCredentialsInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    const apiBase = environment.serverUrl.replace(/\/+$/, '');
    if (req.url.startsWith('/api') || req.url.startsWith(apiBase)) {
      req = req.clone({
        withCredentials: true,
      });
    }

    return next.handle(req);
  }
}

export const withCredentialsInterceptor = [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: WithCredentialsInterceptor,
    multi: true,
  },
];
