import type {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root',
})
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
    return next.handle(request);
  }

  private cloneRequest(request: HttpRequest<unknown>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: 'Bearer ' + token,
      },
    });
  }
}
