import {
  HTTP_INTERCEPTORS,
  type HttpEvent,
  HttpHandler,
  type HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class WithCredentialsInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    req = req.clone({
      withCredentials: true,
    });

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
