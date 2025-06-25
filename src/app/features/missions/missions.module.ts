// src/app/features/missions/missions.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { IonicModule } from '@ionic/angular';

import { MissionsPageRoutingModule } from './missions-routing.module';
import { MissionsPage } from './missions.page';
import { MissionService } from './services/mission.service';
import { ApplicationService } from './services/application.service';
import { ApplicationModalComponent } from './application-modal/application-modal.component'; // ✅ CORRECTION DU CHEMIN

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HttpClientModule,
    MissionsPageRoutingModule
    // ❌ PAS ApplicationModalComponent ici - c'est un composant normal, pas standalone
  ],
  declarations: [
    MissionsPage,
    ApplicationModalComponent // ✅ Les composants NON-standalone vont dans declarations
  ],
  providers: [
    MissionService,
    ApplicationService
  ]
})
export class MissionsPageModule {}