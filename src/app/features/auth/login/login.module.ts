// src/app/features/auth/login/login.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LoginPageRoutingModule } from './login-routing.module';
import { LoginPage } from './login.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule, // ✅ Nécessaire pour ngModel
    IonicModule,
    LoginPageRoutingModule
  ],
  declarations: [
    LoginPage // ✅ Déclarer le composant ici
  ]
})
export class LoginPageModule {}