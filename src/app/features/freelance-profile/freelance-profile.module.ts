import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FreelanceProfilePageRoutingModule } from './freelance-profile-routing.module';

import { FreelanceProfilePage } from './freelance-profile.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FreelanceProfilePageRoutingModule
  ],
  declarations: [FreelanceProfilePage]
})
export class FreelanceProfilePageModule {}
