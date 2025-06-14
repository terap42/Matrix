// src/app/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Ajouter le token d'authentification si disponible
    return this.authService.token$.pipe(
      take(1),
      switchMap(token => {
        let authReq = req;
        
        if (token && !req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
          authReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });
        }

        return next.handle(authReq).pipe(
          catchError((error: HttpErrorResponse) => {
            // Gérer les erreurs d'authentification
            if (error.status === 401 || error.status === 403) {
              // Token expiré ou invalide
              this.authService.logout().then(() => {
                this.router.navigate(['/login']);
              });
            }
            
            return throwError(error);
          })
        );
      })
    );
  }
}