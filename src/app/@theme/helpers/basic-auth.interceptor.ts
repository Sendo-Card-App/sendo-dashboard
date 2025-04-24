// src/app/auth/basic-auth.interceptor.ts
import { Injectable, inject } from '@angular/core';
import {
  HttpRequest, HttpHandler,
  HttpEvent, HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class BasicAuthInterceptor implements HttpInterceptor {
  private auth = inject(AuthenticationService);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const user = this.auth.currentUserValue;
    if (user?.serviceToken && req.url.startsWith(environment.apiUrl)) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${user.serviceToken}` }
      });
    }
    return next.handle(req);
  }
}
