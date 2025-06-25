// src/app/register/register.page.ts
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

  // Variables pour la validation en temps réel
  emailError: string = '';
  passwordError: string = '';
  confirmPasswordError: string = '';
  firstNameError: string = '';
  lastNameError: string = '';

  // Indicateurs de force du mot de passe
  passwordChecks = {
    length: false,
    hasLetter: false,
    hasNumber: false
  };

  constructor(
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private authService: AuthService,
    private ngZone: NgZone
  ) {}

  // Validation en temps réel de l'email
  validateEmailField() {
    const email = this.formData.email.trim();
    if (email.length === 0) {
      this.emailError = '';
      return;
    }
    
    if (!email.includes('@')) {
      this.emailError = 'L\'email doit contenir un @';
      return;
    }
    
    if (!email.includes('.') || email.indexOf('.') <= email.indexOf('@')) {
      this.emailError = 'L\'email doit contenir un . après le @';
      return;
    }
    
    if (!this.isValidEmail(email)) {
      this.emailError = 'Format d\'email invalide';
      return;
    }
    
    this.emailError = '';
  }

  // Validation en temps réel du mot de passe
  validatePasswordField() {
    const password = this.formData.password;
    this.passwordChecks.length = password.length >= 6;
    this.passwordChecks.hasLetter = /[A-Za-z]/.test(password);
    this.passwordChecks.hasNumber = /\d/.test(password);

    if (password.length === 0) {
      this.passwordError = '';
      return;
    }

    if (password.length < 6) {
      this.passwordError = 'Le mot de passe doit contenir au moins 6 caractères';
      return;
    }

    if (!this.passwordChecks.hasLetter) {
      this.passwordError = 'Le mot de passe doit contenir au moins une lettre';
      return;
    }

    if (!this.passwordChecks.hasNumber) {
      this.passwordError = 'Le mot de passe doit contenir au moins un chiffre';
      return;
    }

    this.passwordError = '';
    // Re-valider la confirmation si elle existe
    if (this.confirmPassword.length > 0) {
      this.validateConfirmPasswordField();
    }
  }

  // Validation en temps réel de la confirmation du mot de passe
  validateConfirmPasswordField() {
    if (this.confirmPassword.length === 0) {
      this.confirmPasswordError = '';
      return;
    }

    if (this.formData.password !== this.confirmPassword) {
      this.confirmPasswordError = 'Les mots de passe ne correspondent pas';
      return;
    }

    this.confirmPasswordError = '';
  }

  // Validation en temps réel du prénom
  validateFirstNameField() {
    const firstName = this.formData.first_name.trim();
    if (firstName.length === 0) {
      this.firstNameError = '';
      return;
    }

    if (firstName.length < 2) {
      this.firstNameError = 'Le prénom doit contenir au moins 2 caractères';
      return;
    }

    if (!/^[a-zA-ZÀ-ÿ\s\'-]+$/.test(firstName)) {
      this.firstNameError = 'Le prénom ne peut contenir que des lettres';
      return;
    }

    this.firstNameError = '';
  }

  // Validation en temps réel du nom
  validateLastNameField() {
    const lastName = this.formData.last_name.trim();
    if (lastName.length === 0) {
      this.lastNameError = '';
      return;
    }

    if (lastName.length < 2) {
      this.lastNameError = 'Le nom doit contenir au moins 2 caractères';
      return;
    }

    if (!/^[a-zA-ZÀ-ÿ\s\'-]+$/.test(lastName)) {
      this.lastNameError = 'Le nom ne peut contenir que des lettres';
      return;
    }

    this.lastNameError = '';
  }

  // Vérifier si le formulaire est valide
  isFormValid(): boolean {
    return this.emailError === '' && 
           this.passwordError === '' && 
           this.confirmPasswordError === '' &&
           this.firstNameError === '' &&
           this.lastNameError === '' &&
           this.formData.email.length > 0 &&
           this.formData.password.length > 0 &&
           this.confirmPassword.length > 0 &&
           this.formData.first_name.length > 0 &&
           this.formData.last_name.length > 0;
  }

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
    // Validation finale avec trim
    this.formData.email = this.formData.email.trim();
    this.formData.password = this.formData.password.trim();
    this.confirmPassword = this.confirmPassword.trim();

    // Re-valider tous les champs
    this.validateEmailField();
    this.validatePasswordField();
    this.validateConfirmPasswordField();

    if (!this.formData.email || !this.formData.password || !this.confirmPassword) {
      this.showToast('Veuillez remplir tous les champs', 'warning');
      return false;
    }

    if (this.emailError || this.passwordError || this.confirmPasswordError) {
      this.showToast('Veuillez corriger les erreurs signalées', 'warning');
      return false;
    }

    return true;
  }

  validateStep2(): boolean {
    // Trim des espaces
    this.formData.first_name = this.formData.first_name.trim();
    this.formData.last_name = this.formData.last_name.trim();

    // Re-valider tous les champs
    this.validateFirstNameField();
    this.validateLastNameField();

    if (!this.formData.first_name || !this.formData.last_name || !this.formData.user_type) {
      this.showToast('Veuillez remplir tous les champs obligatoires', 'warning');
      return false;
    }

    if (this.firstNameError || this.lastNameError) {
      this.showToast('Veuillez corriger les erreurs signalées', 'warning');
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
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  private isValidPassword(password: string): boolean {
    // Au moins une lettre et un chiffre
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
    return passwordRegex.test(password);
  }

  private isValidName(name: string): boolean {
    // Seulement des lettres, espaces, apostrophes et tirets
    const nameRegex = /^[a-zA-ZÀ-ÿ\s\'-]+$/;
    return nameRegex.test(name) && name.length >= 2;
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