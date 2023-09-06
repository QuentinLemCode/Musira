import type {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class JwtInterceptor implements HttpInterceptor {
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
    return localStorage.getItem('token');
  }
}
