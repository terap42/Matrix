import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { IonicModule } from '@ionic/angular';

import { MissionsPageRoutingModule } from './missions-routing.module';
import { MissionsPage } from './missions.page';
import { MissionService } from './services/mission.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HttpClientModule, // Nécessaire pour les appels HTTP
    MissionsPageRoutingModule
  ],
  declarations: [
    MissionsPage
  ],
  providers: [
    MissionService // Service fourni au niveau du module
  ]
})
export class MissionsPageModule {}