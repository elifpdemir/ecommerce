import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

// auth.interceptor.ts dosyanı şu şekilde güncelle:

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken(); // localStorage yerine servisten al

  console.log('🚀 INTERCEPTOR ÇALIŞTI! Hedef URL:', req.url);
  console.log('Servisten Gelen Token:', token);

  // Burası çok kritik: Eğer login isteği atıyorsak header ekleme (sonsuz döngüye girer)
  if (req.url.includes('/api/auth/login')) {
    return next(req);
  }

  const cloned = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        auth.logout();
      }
      return throwError(() => error);
    })
  );
};
