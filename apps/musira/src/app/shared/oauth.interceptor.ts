import type {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OAuthStorage } from 'angular-oauth2-oidc';
import { Observable } from 'rxjs';

@Injectable()
export class OAuthInterceptor implements HttpInterceptor {
  constructor(private authStorage: OAuthStorage) {}

  private checkUrl(url: string): boolean {
    return url.startsWith('/api/');
  }

  public intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    const url = req.url.toLowerCase();

    if (!this.checkUrl(url)) return next.handle(req);

    const token = this.authStorage.getItem('id_token');
    const header = 'Bearer ' + token;

    const headers = req.headers.set('Authorization', header);

    req = req.clone({ headers });

    return next.handle(req);
  }
}
