// src/app/login/login.page.ts du matrix
import { Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit, OnDestroy {
  loginForm: FormGroup;
  hidePassword = true;
  loginError: string = '';
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private authService: AuthService,
    private ngZone: NgZone
  ) {
    this.loginForm = this.fb.group({
      email: ['admin@gmail.com', [Validators.required, Validators.email]],
      password: ['Ndjamena2020', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Si vous avez un store ou des observables pour gérer l'état d'authentification,
    // vous pouvez les ajouter ici
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async login() {
    if (this.loginForm.valid) {
      const loading = await this.loadingController.create({
        message: 'Connexion en cours...',
        spinner: 'circular'
      });

      try {
        await loading.present();
        this.isLoading = true;
        this.loginError = '';

        const formValue = this.loginForm.value;
        const response = await this.authService.login(formValue.email, formValue.password);

        await loading.dismiss();
        await this.showToast(response.message, 'success');

        // Redirection selon le type d'utilisateur
        this.ngZone.run(() => {
          switch (response.user.user_type) {
            case 'admin':
              this.router.navigateByUrl('/admin/dashboard', { replaceUrl: true });
              break;
            case 'freelance':
              this.router.navigateByUrl('/tabs/home', { replaceUrl: true });
              break;
            case 'client':
              this.router.navigateByUrl('/tabs/home', { replaceUrl: true });
              break;
            default:
              this.router.navigateByUrl('/tabs', { replaceUrl: true });
          }
        });

      } catch (error: any) {
        await loading.dismiss();
        console.error('Erreur de connexion:', error);
        
        let errorMessage = 'Erreur de connexion';
        if (error.error && error.error.error) {
          errorMessage = error.error.error;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        this.loginError = errorMessage;
        await this.showToast(errorMessage, 'danger');
        
      } finally {
        this.isLoading = false;
      }
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      this.markFormAsTouched();
      await this.showToast('Veuillez corriger les erreurs dans le formulaire', 'warning');
    }
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  // Méthode corrigée pour aller vers register
  goToRegister() {
    this.ngZone.run(() => {
      // Essayez d'abord avec /register, sinon avec /auth/register
      this.router.navigate(['/register']).catch(() => {
        // Si /register ne fonctionne pas, essayez /auth/register
        this.router.navigate(['/auth/register']).catch(() => {
          console.error('Route register non trouvée. Vérifiez votre app-routing.module.ts');
          this.showToast('Page d\'inscription non disponible', 'warning');
        });
      });
    });
  }

  // Nouvelle méthode pour mot de passe oublié
  goToForgotPassword() {
    this.ngZone.run(() => {
      this.router.navigate(['/forgot-password']).catch(() => {
        console.error('Route forgot-password non trouvée');
        this.showToast('Page mot de passe oublié non disponible', 'warning');
      });
    });
  }

  private markFormAsTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color,
      buttons: [
        {
          text: '✕',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  // Méthode pour gérer l'entrée (touche Enter)
  onKeyPress(event: any) {
    if (event.key === 'Enter') {
      this.login();
    }
  }
}