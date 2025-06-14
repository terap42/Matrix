// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (user) {
          // Vérifier les rôles si spécifiés dans les données de route
          const allowedRoles = route.data['roles'] as Array<string>;
          if (allowedRoles && !allowedRoles.includes(user.user_type)) {
            this.router.navigate(['/unauthorized']);
            return false;
          }
          return true;
        } else {
          this.router.navigate(['/login']);
          return false;
        }
      })
    );
  }
}

// Guard spécifique pour les admins
@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (user && user.user_type === 'admin') {
          return true;
        } else {
          this.router.navigate(['/login']);
          return false;
        }
      })
    );
  }
}

// Guard pour empêcher l'accès aux pages d'auth si déjà connecté
@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (user) {
          // Rediriger selon le type d'utilisateur
          switch (user.user_type) {
            case 'admin':
              this.router.navigate(['/admin/dashboard']);
              break;
            case 'freelance':
            case 'client':
              this.router.navigate(['/tabs/home']);
              break;
            default:
              this.router.navigate(['/tabs']);
          }
          return false;
        }
        return true;
      })
    );
  }
}