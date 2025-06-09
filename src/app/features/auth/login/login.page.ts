

import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
    standalone:false,
})
export class LoginPage {
  email: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private alertController: AlertController,
    private ngZone: NgZone // ➤ injection de NgZone
  ) {}

  async login() {
    if (this.email === 'admin@' && this.password === 'admin') {
      this.ngZone.run(() => {
        this.router.navigateByUrl('/admin', { replaceUrl: true });
      });
    } else if (this.email === 'user@' && this.password === 'user') {
      this.ngZone.run(() => {
        this.router.navigateByUrl('/tabs', { replaceUrl: true });
      });
    } else {
      const alert = await this.alertController.create({
        header: 'Erreur',
        message: 'Identifiant ou mot de passe incorrect.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
