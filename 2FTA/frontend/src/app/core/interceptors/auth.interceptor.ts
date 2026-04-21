import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const isPublicAuthRequest = req.url.includes('/auth/login/') || req.url.includes('/auth/register/');
  const token = isPublicAuthRequest ? null : authService.getAccessToken();

  const request = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next(request).pipe(
    catchError((error) => {
      if (!isPublicAuthRequest && error.status === 401) {
        authService.clearSession();
        router.navigateByUrl('/login');
      }

      return throwError(() => error);
    }),
  );
};
