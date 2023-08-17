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
    const token = this.users.getToken();
    if (!token) {
      return next.handle(request);
    }
    request = this.cloneRequest(request, token);
    return next.handle(request).pipe(
      catchError((error) => {
        if (
          this.users.isEmailLogin &&
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
    return this.users.refreshEmailToken().pipe(
      switchMap((userLogin) => {
        request = this.cloneRequest(request, userLogin.token);
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
