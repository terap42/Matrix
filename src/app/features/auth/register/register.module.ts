// src/app/features/auth/register/register.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RegisterPageRoutingModule } from './register-routing.module';
import { RegisterPage } from './register.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule, // ✅ Nécessaire pour ngModel
    IonicModule,
    RegisterPageRoutingModule
  ],
  declarations: [
    RegisterPage // ✅ Déclarer le composant ici au lieu de l'importer
  ]
})
export class RegisterPageModule {}