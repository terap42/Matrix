import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RegisterPageRoutingModule } from './register-routing.module';
import { RegisterPage } from './register.page'; // Assurez-vous que le chemin est correct

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegisterPageRoutingModule,
    RegisterPage // ✅ Importer le composant standalone ici
  ]
  // ❌ Pas de declarations pour les standalone components
})
export class RegisterPageModule {}
