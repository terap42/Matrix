// src/app/login/login.page.ts
import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private authService: AuthService,
    private ngZone: NgZone
  ) {}

  async login() {
    // Validation des champs
    if (!this.email || !this.password) {
      await this.showToast('Veuillez remplir tous les champs', 'warning');
      return;
    }

    // Validation email
    if (!this.isValidEmail(this.email)) {
      await this.showToast('Veuillez entrer un email valide', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Connexion en cours...',
      spinner: 'circular'
    });

    try {
      await loading.present();
      this.isLoading = true;

      const response = await this.authService.login(this.email, this.password);
      
      await loading.dismiss();
      await this.showToast(response.message, 'success');

      // Redirection selon le type d'utilisateur
      this.ngZone.run(() => {
        switch (response.user.user_type) {
          case 'admin':
            this.router.navigateByUrl('admin/dashboard', { replaceUrl: true });
            break;
          case 'freelance':
            this.router.navigateByUrl('tabs/home', { replaceUrl: true });
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

      await this.showAlert('Erreur de connexion', errorMessage);
    } finally {
      this.isLoading = false;
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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