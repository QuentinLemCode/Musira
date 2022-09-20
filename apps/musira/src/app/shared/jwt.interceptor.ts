import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { UserService } from '../services/user.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private users: UserService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const token = this.users.getToken();
    if (!token) {
      return next.handle(request);
    }
    request = this.cloneRequest(request, token);
    return next.handle(request).pipe(
      catchError((error) => {
        if (
          error instanceof HttpErrorResponse &&
          !request.url.includes('auth/login') &&
          !request.url.includes('auth/refresh') &&
          error.status === 401
        ) {
          return this.refreshToken(request, next);
        }
        return throwError(error);
      })
    );
  }

  private refreshToken(request: HttpRequest<unknown>, next: HttpHandler) {
    return this.users.refreshToken().pipe(
      switchMap((userLogin) => {
        request = this.cloneRequest(request, userLogin.access_token);
        return next.handle(request);
      })
    );
  }

  private cloneRequest(request: HttpRequest<unknown>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: 'Bearer ' + token,
      },
    });
  }
}
