import type {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(@Inject(UserService) private users: UserService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    const loggedUser = this.users.loggedUser();
    if (!loggedUser.isLoggedIn) {
      return next.handle(request);
    }
    const token = loggedUser.token;
    request = this.cloneRequest(request, token);
    return next.handle(request).pipe(
      catchError((error) => {
        console.log(error);
        if (
          error instanceof HttpErrorResponse &&
          !request.url.includes('users/email/login') &&
          !request.url.includes('users/email/refresh') &&
          error.status === 401
        ) {
          return this.refreshToken(request, next);
        }
        return throwError(() => error);
      }),
    );
  }

  private refreshToken(request: HttpRequest<unknown>, next: HttpHandler) {
    console.log('refreshing token');
    return this.users.refreshTokenIfExpired().pipe(
      switchMap(() => {
        const loggedUser = this.users.loggedUser();
        if (loggedUser.isLoggedIn === false) {
          console.error('not logged in');
          return next.handle(request);
        }
        request = this.cloneRequest(request, loggedUser.token);
        return next.handle(request);
      }),
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
