import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MissionDetailsPageRoutingModule } from './mission-details-routing.module';

import { MissionDetailsPage } from './mission-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MissionDetailsPageRoutingModule,
  ],
  declarations: [MissionDetailsPage],
})
export class MissionDetailsPageModule {}
