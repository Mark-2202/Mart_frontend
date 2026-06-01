import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, handler) => {
  const authService = inject(Auth);
  const currentUser = authService.currentUser();

  let authReq = req;
  if (currentUser && currentUser.token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${currentUser.token}`,
      },
    });
  }

  return handler(authReq).pipe(
    catchError((error) => {
      // 401 Unauthorized check
      if (error.status === 401) {
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
