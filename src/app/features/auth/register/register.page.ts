// src/app/features/auth/register/register.page.ts
import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AuthService, RegisterData } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false // ✅ Important: non-standalone
})
export class RegisterPage {
  formData: RegisterData = {
    email: '',
    password: '',
    user_type: 'freelance',
    first_name: '',
    last_name: '',
    phone: '',
    location: '',
    bio: ''
  };
  
  confirmPassword: string = '';
  isLoading: boolean = false;
  currentStep: number = 1;
  totalSteps: number = 3;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private authService: AuthService,
    private ngZone: NgZone
  ) {}

  async register() {
    // Validation finale
    if (!this.validateAllFields()) {
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Création du compte...',
      spinner: 'circular'
    });

    try {
      await loading.present();
      this.isLoading = true;

      const response = await this.authService.register(this.formData);
      
      await loading.dismiss();
      await this.showToast('Compte créé avec succès !', 'success');

      // Redirection selon le type d'utilisateur
      this.ngZone.run(() => {
        switch (response.user.user_type) {
          case 'freelance':
            this.router.navigateByUrl('/tabs/dashboard', { replaceUrl: true });
            break;
          case 'client':
            this.router.navigateByUrl('/tabs/dashboard', { replaceUrl: true });
            break;
          default:
            this.router.navigateByUrl('/tabs', { replaceUrl: true });
        }
      });

    } catch (error: any) {
      await loading.dismiss();
      console.error('Erreur d\'inscription:', error);
      
      let errorMessage = 'Erreur lors de la création du compte';
      if (error?.error?.error) {
        errorMessage = error.error.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      await this.showAlert('Erreur d\'inscription', errorMessage);
    } finally {
      this.isLoading = false;
    }
  }

  nextStep() {
    if (this.currentStep === 1 && this.validateStep1()) {
      this.currentStep = 2;
    } else if (this.currentStep === 2 && this.validateStep2()) {
      this.currentStep = 3;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  validateStep1(): boolean {
    if (!this.formData.email || !this.formData.password || !this.confirmPassword) {
      this.showToast('Veuillez remplir tous les champs', 'warning');
      return false;
    }

    if (!this.isValidEmail(this.formData.email)) {
      this.showToast('Veuillez entrer un email valide', 'warning');
      return false;
    }

    if (this.formData.password.length < 6) {
      this.showToast('Le mot de passe doit contenir au moins 6 caractères', 'warning');
      return false;
    }

    if (this.formData.password !== this.confirmPassword) {
      this.showToast('Les mots de passe ne correspondent pas', 'warning');
      return false;
    }

    return true;
  }

  validateStep2(): boolean {
    if (!this.formData.first_name || !this.formData.last_name || !this.formData.user_type) {
      this.showToast('Veuillez remplir tous les champs obligatoires', 'warning');
      return false;
    }
    return true;
  }

  validateAllFields(): boolean {
    return this.validateStep1() && this.validateStep2();
  }

  goToLogin() {
    this.router.navigate(['/login']);
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

  getProgressWidth(): string {
    return `${(this.currentStep / this.totalSteps) * 100}%`;
  }
}