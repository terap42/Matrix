import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GestMissionsPageRoutingModule } from './gest-missions-routing.module';

import { GestMissionsPage } from './gest-missions.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GestMissionsPageRoutingModule
  ],
  declarations: [GestMissionsPage]
})
export class GestMissionsPageModule {}
