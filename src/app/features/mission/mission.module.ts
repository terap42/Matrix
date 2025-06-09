import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MissionPageRoutingModule } from './mission-routing.module';

import { MissionPage } from './mission.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule ,
    IonicModule,
    MissionPageRoutingModule
  ],
  declarations: [MissionPage]
})
export class MissionPageModule {}
