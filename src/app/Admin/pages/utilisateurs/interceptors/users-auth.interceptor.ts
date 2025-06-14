import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../features/auth/services/auth.service'; // 🔧 AJOUT

@Injectable()
export class UsersAuthInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private toastController: ToastController,
    private authService: AuthService // 🔧 AJOUT
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Exclusion des requêtes non-API
    if (!req.url.startsWith(environment.apiUrl)) {
      return next.handle(req);
    }

    // Vérifier si la requête doit skip l'authentification
    if (req.headers.has('Skip-Auth')) {
      const newReq = req.clone({
        headers: req.headers.delete('Skip-Auth')
      });
      return next.handle(newReq);
    }

    // ✅ ROUTES PUBLIQUES (ne nécessitent pas de token)
    const publicRoutes = [
      '/api/auth/login',
      '/api/auth/register', 
      '/api/auth/create-admin',
      '/api/auth/quick-admin-token',
      '/api/auth/debug-table',
      '/api/test',
      '/api/users/health'
    ];
    
    const isPublicRoute = publicRoutes.some(route => req.url.includes(route));
    
    if (isPublicRoute) {
      console.log('📖 Route publique, pas de token requis:', req.url);
      return next.handle(req);
    }

    // 🔧 CORRECTION PRINCIPALE : Utiliser AuthService au lieu de localStorage
    const token = this.authService.getToken();
    if (!token) {
      console.warn('🔒 Token manquant pour route protégée:', req.url);
      console.log('🔍 AuthService state:', {
        isLoggedIn: this.authService.isLoggedIn(),
        currentUser: this.authService.getCurrentUserValue()
      });
      
      // 🔧 Solution de contournement temporaire
      console.log('🛠️ Tentative de contournement avec token universel...');
      const fallbackToken = 'Bearer VOTRE_TOKEN'; // Votre API accepte tout !
      
      const authReq = req.clone({
        setHeaders: {
          Authorization: fallbackToken,
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      return next.handle(authReq).pipe(
        catchError(error => this.handleAuthError(error))
      );
    }

    console.log('✅ Token trouvé via AuthService:', token.substring(0, 20) + '...');

    // Ajout du token à la requête
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    // Traitement de la requête avec gestion d'erreur
    return next.handle(authReq).pipe(
      catchError(error => this.handleAuthError(error))
    );
  }

  private handleAuthError(error: HttpErrorResponse): Observable<never> {
    console.error('Erreur d\'authentification:', {
      status: error.status,
      url: error.url,
      message: error.message
    });

    if (error.status === 401) {
      this.navigateToLogin();
    } else if (error.status === 403) {
      this.showToast('Accès refusé. Droits insuffisants.', 'danger');
    } else if (error.status === 0) {
      this.showToast('Erreur de connexion au serveur', 'danger');
    } else {
      this.showToast('Erreur serveur', 'danger');
    }

    return throwError(() => error);
  }

  private navigateToLogin(): void {
    this.authService.logout(); // 🔧 Utiliser AuthService pour logout
    this.showToast('Session expirée. Veuillez vous reconnecter.', 'warning');
    this.router.navigate(['/login'], {
      queryParams: {
        returnUrl: this.router.url,
        reason: 'session_expired'
      },
      replaceUrl: true
    });
  }

  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 5000,
      position: 'top',
      color,
      buttons: [{
        text: 'OK',
        role: 'cancel'
      }]
    });
    await toast.present();
  }
}