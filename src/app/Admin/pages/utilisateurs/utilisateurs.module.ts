// src/app/Admin/pages/utilisateurs/utilisateurs.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { UtilisateursPageRoutingModule } from './utilisateurs-routing.module';
import { UtilisateursPage } from './utilisateurs.page';

// Services dédiés
import { UsersAuthService } from './services/users-auth.service';
import { UsersManagementService } from './services/users-management.service';

// Intercepteur dédié
import { UsersAuthInterceptor } from './interceptors/users-auth.interceptor';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    HttpClientModule,
    UtilisateursPageRoutingModule
  ],
  declarations: [
    UtilisateursPage
  ],
  providers: [
    // Services dédiés à la gestion des utilisateurs
    UsersAuthService,
    UsersManagementService,
    
    // Intercepteur HTTP dédié pour les requêtes users
    {
      provide: HTTP_INTERCEPTORS,
      useClass: UsersAuthInterceptor,
      multi: true
    }
  ]
})
export class UtilisateursPageModule {
  constructor() {
    console.log('🚀 Module UtilisateursPage chargé avec services dédiés');
  }
}